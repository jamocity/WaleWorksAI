$ErrorActionPreference = 'Stop'

$projectRoot = (Get-Location).Path
$cssTarget = Join-Path $projectRoot 'app\globals.css'
$cssSource = Join-Path $projectRoot 'styles\guest-ux-accessibility.css'
$marker = 'WALEWORKS GUEST EXPERIENCE + APP-WIDE READABILITY UPGRADE'

if (-not (Test-Path -LiteralPath $cssTarget)) {
    throw "Cannot find app\globals.css. Run this script from the WaleWorksAI project root."
}

if (-not (Test-Path -LiteralPath $cssSource)) {
    throw "Cannot find styles\guest-ux-accessibility.css. Extract the complete update ZIP first."
}

$existingCss = [System.IO.File]::ReadAllText($cssTarget)
if ($existingCss.Contains($marker)) {
    Write-Host 'Readability styles are already installed. No duplicate CSS was added.' -ForegroundColor Yellow
    exit 0
}

$overrideCss = [System.IO.File]::ReadAllText($cssSource)
$utf8NoBom = [System.Text.UTF8Encoding]::new($false)
[System.IO.File]::AppendAllText($cssTarget, [Environment]::NewLine + [Environment]::NewLine + $overrideCss + [Environment]::NewLine, $utf8NoBom)

Write-Host 'Guest career scenarios and readability styles installed.' -ForegroundColor Green
Write-Host 'Updated: app\globals.css'
Write-Host 'Updated: components\guest-playground.tsx'
Write-Host 'Added: lib\guest-workdays.ts'
