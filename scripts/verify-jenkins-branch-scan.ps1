<#
Usage: From repo root in PowerShell:
 .\scripts\verify-jenkins-branch-scan.ps1 -MultibranchName movie-bff-multibranch -Branches feature/integrante3-test-b1,feature/integrante4-test-b2,feature/integrante5-test-b3

This script will:
- Poll Jenkins Multibranch job until the specified branches are discovered (timeout configurable).
- Trigger a build for each discovered branch and wait for completion, reporting the result.

Requires: PowerShell, Jenkins reachable at http://localhost:8080, admin credentials (default admin/admin123). Adjust variables below if different.
#>

param(
    [string]$JenkinsUrl = 'http://localhost:8080',
    [string]$User = 'admin',
    [string]$Pass = 'admin123',
    [string]$MultibranchName = 'movie-bff-multibranch',
    [string]$Branches = 'feature/integrante3-test-b1,feature/integrante4-test-b2,feature/integrante5-test-b3',
    [int]$PollIntervalSeconds = 15,
    [int]$TimeoutSeconds = 360
)

function Get-JenkinsJson($path) {
    $url = "$JenkinsUrl/$path" -replace '//','/'
    $creds = New-Object System.Management.Automation.PSCredential($User,(ConvertTo-SecureString $Pass -AsPlainText -Force))
    try {
        return Invoke-RestMethod -Uri $url -Credential $creds -UseBasicParsing -ErrorAction Stop
    } catch {
        Write-Host "Failed to GET $url : $_" -ForegroundColor Yellow
        return $null
    }
}

$targetBranches = $Branches -split ',' | ForEach-Object { $_.Trim() }
Write-Host "Waiting up to $TimeoutSeconds seconds for branches: $($targetBranches -join ', ')" -ForegroundColor Cyan

$end = (Get-Date).AddSeconds($TimeoutSeconds)
$found = @{}
foreach ($b in $targetBranches) { $found[$b] = $false }

while ((Get-Date) -lt $end -and ($found.Values -contains $false)) {
    $json = Get-JenkinsJson "job/$MultibranchName/api/json?depth=1"
    if ($json -ne $null -and $json.jobs) {
        $present = $json.jobs | ForEach-Object { $_.name }
        foreach ($b in $targetBranches) {
            if (-not $found[$b] -and ($present -contains $b)) {
                Write-Host "Found branch: $b" -ForegroundColor Green
                $found[$b] = $true
            }
        }
    } else {
        Write-Host "Multibranch job not available yet or API failed, retrying..." -ForegroundColor Yellow
    }
    if ($found.Values -contains $false) { Start-Sleep -Seconds $PollIntervalSeconds }
}

if ($found.Values -contains $false) {
    Write-Host "Timeout reached. Branch(es) not found: $(( $found.GetEnumerator() | Where-Object { -not $_.Value } | ForEach-Object { $_.Key }) -join ', ')" -ForegroundColor Red
    exit 2
}

Write-Host "All target branches present. Triggering builds..." -ForegroundColor Cyan

foreach ($b in $targetBranches) {
    Write-Host "Triggering build for branch $b..." -ForegroundColor Cyan
    # Get the branch job URL from the multibranch API
    $json = Get-JenkinsJson "job/$MultibranchName/job/$([uri]::EscapeDataString($b))/api/json"
    if ($json -eq $null) { Write-Host "Failed to access branch job API for $b" -ForegroundColor Yellow; continue }
    $buildUrl = $json.url + 'build'
    try {
        # trigger build
        Invoke-RestMethod -Uri $buildUrl -Credential (New-Object System.Management.Automation.PSCredential($User,(ConvertTo-SecureString $Pass -AsPlainText -Force))) -Method Post -UseBasicParsing -ErrorAction Stop
    } catch {
        Write-Host "Triggering build may have returned non-JSON response; proceeding to polling." -ForegroundColor Yellow
    }

    # Poll for build start and completion
    $buildTimeout = (Get-Date).AddMinutes(10)
    $buildNumber = $null
    while ((Get-Date) -lt $buildTimeout -and -not $buildNumber) {
        $bj = Get-JenkinsJson "job/$MultibranchName/job/$([uri]::EscapeDataString($b))/api/json"
        if ($bj -ne $null -and $bj.lastBuild) { $buildNumber = $bj.lastBuild.number; break }
        Start-Sleep -Seconds 5
    }
    if (-not $buildNumber) { Write-Host "Timed out waiting for build to start for $b" -ForegroundColor Red; continue }

    Write-Host "Build #$buildNumber started for $b. Waiting for completion..." -ForegroundColor Cyan
    $completed = $false
    while ((Get-Date) -lt $buildTimeout -and -not $completed) {
        $status = Get-JenkinsJson "job/$MultibranchName/job/$([uri]::EscapeDataString($b))/$buildNumber/api/json"
        if ($status -and $status.result) { $completed = $true; Write-Host "Build #$buildNumber finished with result: $($status.result)" -ForegroundColor Green }
        else { Start-Sleep -Seconds 5 }
    }
    if (-not $completed) { Write-Host "Timed out waiting for build #$buildNumber to finish for $b" -ForegroundColor Red }
}

Write-Host "Verification script finished." -ForegroundColor Cyan
