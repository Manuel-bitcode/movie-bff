# Simple helper to publish the prepared Jenkins onboarding comment to an Issue or PR using GitHub CLI (`gh`).
# Usage:
# 1) Ensure GitHub CLI is installed and authenticated (`gh auth login`).
# 2) Run from repo root: .\scripts\publish-jenkins-setup-comment.ps1 -TargetNumber 123 -Type pr
# Options: -DryRun will show the comment body without posting.

param(
    [Parameter(Mandatory=$true)][int]$TargetNumber,
    [Parameter(Mandatory=$false)][ValidateSet('issue','pr')][string]$Type = 'issue',
    [switch]$DryRun
)

$repo = 'Manuel-bitcode/movie-bff'
$commentFile = "documentacion/entrega2/JENKINS_SETUP_COMMENT.md"
if (-not (Test-Path $commentFile)) { Write-Host "Comment file not found: $commentFile" -ForegroundColor Red; exit 1 }

$body = Get-Content $commentFile -Raw

Write-Host "Prepared comment (first 300 chars):`n" + $body.Substring(0,[Math]::Min(300,$body.Length))
if ($DryRun) { Write-Host "Dry run: not posting."; exit 0 }

if ($Type -eq 'issue') {
    Write-Host "Posting comment to issue #$TargetNumber in $repo..."
    gh issue comment $TargetNumber --repo $repo --body "$body"
} else {
    Write-Host "Posting comment to PR #$TargetNumber in $repo..."
    gh pr comment $TargetNumber --repo $repo --body "$body"
}

Write-Host "Done. Verify the comment in the GitHub UI or via gh api." -ForegroundColor Green
