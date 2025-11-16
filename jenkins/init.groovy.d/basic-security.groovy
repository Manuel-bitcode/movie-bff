import jenkins.model.*
import hudson.security.*

def env = System.getenv()
def adminUser = env['JENKINS_ADMIN_USER'] ?: 'admin'
def adminPass = env['JENKINS_ADMIN_PASSWORD'] ?: 'admin123'

def instance = Jenkins.getInstance()

// If security is already set up, don't override
if (instance.getSecurityRealm() instanceof HudsonPrivateSecurityRealm) {
    println('Security already configured, skipping init groovy.')
    return
}

println("Creating admin user: ${adminUser}")
def hudsonRealm = new HudsonPrivateSecurityRealm(false)
hudsonRealm.createAccount(adminUser, adminPass)
instance.setSecurityRealm(hudsonRealm)

def strategy = new FullControlOnceLoggedInAuthorizationStrategy()
instance.setAuthorizationStrategy(strategy)

instance.save()
println('Basic security configured.')
