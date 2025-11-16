import jenkins.model.Jenkins
import hudson.triggers.TimerTrigger
import java.util.logging.Logger

def log = Logger.getLogger("ensure-periodic-scan")
def jobName = System.getenv('MULTIBRANCH_JOB_NAME') ?: 'movie-bff-multibranch'
log.info("Init: ensure-periodic-scan.groovy running. jobName=${jobName}")

def instance = Jenkins.getInstanceOrNull()
if (instance == null) {
    log.warning('Jenkins instance not available, skipping')
    return
}

def job = instance.getItemByFullName(jobName)
if (job == null) {
    log.warning("Job ${jobName} not found; skipping TimerTrigger creation.")
    return
}

try {
    def triggers = job.getTriggers()
    def existing = triggers.values().find { it instanceof TimerTrigger }
    if (existing) {
        try {
            def spec = existing.spec
            log.info("Job ${jobName} already has TimerTrigger with spec=${spec}")
        } catch (ignored) {
            log.info("Job ${jobName} already has a TimerTrigger (spec unknown)")
        }
        return
    }

    def spec = System.getenv('PERIODIC_SCAN_SPEC') ?: 'H/5 * * * *'
    def t = new TimerTrigger(spec)
    job.addTrigger(t)
    job.save()
    log.info("Added TimerTrigger ${spec} to job ${jobName}")
} catch (err) {
    log.severe("Failed to ensure TimerTrigger on ${jobName}: ${err}")
    throw err
}
