FROM jenkins/jenkins:lts

# Switch to root to install plugins
USER root

# Install recommended plugins for pipeline + docker + nodejs + reports
RUN jenkins-plugin-cli --plugins \
  git \
  github \
  github-branch-source \
  pipeline-stage-view \
  docker-workflow \
  nodejs \
  junit \
  htmlpublisher \
  credentials-binding \
  workflow-aggregator || true

# Ensure permissions are correct when copying init scripts
USER jenkins

# Copy Groovy init scripts into the recommended image ref dir so Jenkins
# will automatically copy them into the JENKINS_HOME on first start even
# when a docker volume is mounted over /var/jenkins_home.
COPY init.groovy.d /usr/share/jenkins/ref/init.groovy.d

# Keep the setup wizard disabled by default; can be overridden in compose
ENV JAVA_OPTS="-Djenkins.install.runSetupWizard=false"
