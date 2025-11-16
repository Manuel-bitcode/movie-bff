import jenkins.model.*
import jenkins.branch.*
import com.cloudbees.plugins.credentials.*
import com.cloudbees.plugins.credentials.domains.*
import com.cloudbees.plugins.credentials.impl.*
import com.cloudbees.plugins.credentials.SystemCredentialsProvider
import jenkins.plugins.git.*

def env = System.getenv()
def repoUrl = env['GIT_REPO_URL'] ?: 'https://github.com/Manuel-bitcode/movie-bff.git'
def jobName = env['MULTIBRANCH_JOB_NAME'] ?: 'movie-bff-multibranch'
def credId = env['GIT_CREDENTIALS_ID'] ?: 'github-token'
def gitUser = env['GIT_USERNAME'] ?: 'git'
def gitToken = env['GIT_TOKEN'] ?: null

println("Init: create-multibranch.groovy running. repoUrl=${repoUrl}, jobName=${jobName}, credId=${credId}")

def j = Jenkins.getInstance()

// If token provided, ensure credential exists
if (gitToken) {
    println("GIT_TOKEN provided — ensuring credentials id='${credId}' exists")
    def credentialsStore = SystemCredentialsProvider.getInstance().getStore()
    def existing = com.cloudbees.plugins.credentials.CredentialsProvider.lookupCredentials(
        com.cloudbees.plugins.credentials.common.StandardUsernameCredentials.class,
        j,
        null,
        null
    ).find { it.id == credId }

    if (existing) {
        println("Credential ${credId} already exists - skipping creation.")
    } else {
        def c = new UsernamePasswordCredentialsImpl(
            CredentialsScope.GLOBAL,
            credId,
            "Credentials for ${repoUrl}",
            gitUser,
            gitToken
        )
        credentialsStore.addCredentials(Domain.global(), c)
        println("Created credentials id='${credId}' (user='${gitUser}').")
    }
} else {
    println('No GIT_TOKEN provided — will create multibranch without credentials.')
}

try {
    if (j.getItem(jobName) != null) {
        println("Job ${jobName} already exists - updating configuration if needed.")
        def existingJob = j.getItem(jobName)
        try {
            // Update orphanedItemStrategy
            try {
                def clazz = com.cloudbees.hudson.plugins.folder.computed.DefaultOrphanedItemStrategy
                def strat = null
                try {
                    strat = clazz.getDeclaredConstructor(boolean.class, String.class).newInstance(true, "30")
                } catch(def e1) {
                    try {
                        strat = clazz.getDeclaredConstructor(boolean.class, String.class, String.class, boolean.class).newInstance(true, "30", "-1", false)
                    } catch(def e2) {
                        println("Warning: no matching DefaultOrphanedItemStrategy constructor found when updating existing job: ${e2}")
                    }
                }
                if (strat != null) {
                    existingJob.setOrphanedItemStrategy(strat)
                    println("Updated orphanedItemStrategy on existing job ${jobName}")
                }
            } catch(def e) {
                println("Warning: could not update orphanedItemStrategy on ${jobName}: ${e}")
            }

            // Update sources traits and credentials if possible
            try {
                def sources = existingJob.getSourcesList()
                sources.each { bs ->
                    try {
                        def src = bs.getSource()
                        if (src instanceof jenkins.plugins.git.GitSCMSource) {
                            if (gitToken) {
                                src.credentialsId = credId
                                println("Set credentialsId on GitSCMSource to ${credId}")
                            }
                            // add branch discovery and wildcard include trait if missing
                            try {
                                def hasBranchDiscovery = src.getTraits().any { it.class.name.contains('BranchDiscoveryTrait') }
                                if (!hasBranchDiscovery) {
                                    src.getTraits().add(new jenkins.plugins.git.traits.BranchDiscoveryTrait())
                                    println("Added BranchDiscoveryTrait to source of ${jobName}")
                                }
                                def hasWildcard = src.getTraits().any { it.class.name.contains('WildcardSCMHeadFilterTrait') }
                                if (!hasWildcard) {
                                    src.getTraits().add(new jenkins.scm.impl.trait.WildcardSCMHeadFilterTrait("*", ""))
                                    println("Added WildcardSCMHeadFilterTrait to source of ${jobName}")
                                }
                            } catch(def t) {
                                println("Warning: could not add traits to existing source: ${t}")
                            }
                        }
                    } catch(def inner) {
                        // continue
                    }
                }
                existingJob.save()
                println("Updated existing Multibranch job ${jobName}")
            } catch(def e) {
                println("Warning: could not update sources on existing job: ${e}")
            }
        } catch(def ex) {
            println("Warning: error while updating existing job ${jobName}: ${ex}")
        }
        return
    }

    // Create a WorkflowMultibranchProject
    def project = new org.jenkinsci.plugins.workflow.multibranch.WorkflowMultiBranchProject(j, jobName)

    // Create GitSCMSource with credentials if available
    def source
    if (gitToken) {
        source = new GitSCMSource(null, repoUrl, credId, "", "", false)
    } else {
        source = new GitSCMSource(null, repoUrl, "", "", "", false)
    }

    // Harden Multibranch: add branch discovery trait and a wildcard include (detect all branches)
    try {
        // Branch discovery (detect branches with a Jenkinsfile)
        source.getTraits().add(new jenkins.plugins.git.traits.BranchDiscoveryTrait())
        // Include all heads by default (pattern '*')
        source.getTraits().add(new jenkins.scm.impl.trait.WildcardSCMHeadFilterTrait("*", ""))
    } catch (err) {
        println("Warning: could not add traits to GitSCMSource: ${err}")
    }

    project.getSourcesList().add(new BranchSource(source))

    // Orphaned item strategy: keep recent items and prune dead branches (keep last 30 by default)
    try {
        def clazz = com.cloudbees.hudson.plugins.folder.computed.DefaultOrphanedItemStrategy
        def strat = null
        try {
            strat = clazz.getDeclaredConstructor(boolean.class, String.class).newInstance(true, "30")
        } catch(def e1) {
            try {
                strat = clazz.getDeclaredConstructor(boolean.class, String.class, String.class, boolean.class).newInstance(true, "30", "-1", false)
            } catch(def e2) {
                println("Warning: no matching DefaultOrphanedItemStrategy constructor found: ${e2}")
            }
        }
        if (strat != null) {
            project.setOrphanedItemStrategy(strat)
        }
    } catch (err) {
        println("Warning: could not set orphanedItemStrategy: ${err}")
    }

    project.save()
    println("Created multibranch project ${jobName} for ${repoUrl}")
} catch (Throwable t) {
    println("Failed to create multibranch project: ${t}")
    t.printStackTrace()
}
