<#
Remove fallback per-branch jobs from Jenkins home and restart the Jenkins container.
Use this AFTER you verified that the Multibranch pipeline is indexing and building branches correctly.
#>
param(
    [string]$ContainerName = 'jenkins-unified'
)

Write-Host "Removing fallback jobs from container '$ContainerName' (will delete job folders under /var/jenkins_home/jobs)"
$jobs = @('movie-bff-B1','movie-bff-B2','movie-bff-B3','movie-webapp-F2')

foreach ($job in $jobs) {
    Write-Host "Checking job: $job"
    docker exec $ContainerName bash -c "if [ -d /var/jenkins_home/jobs/$job ]; then rm -rf /var/jenkins_home/jobs/$job && echo 'Removed $job'; else echo 'Job $job not present'; fi"
}

Write-Host "Restarting Jenkins container to pick up changes..."
docker restart $ContainerName | Write-Host

Write-Host "Done. Monitor logs: docker-compose logs jenkins --tail 200"
