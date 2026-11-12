\
$ErrorActionPreference = 'Stop'

$projectRoot = (Get-Location).Path
$globalCss = Join-Path $projectRoot 'app\globals.css'
$patchCss = Join-Path $projectRoot 'portfolio-layout-fix.css'
$marker = 'WaleWorks AI: public portfolio identity spacing and visible sign-out action.'

if (-not (Test-Path -LiteralPath $globalCss)) {
    throw "Could not find app\globals.css. Run this script from the WaleWorksAI project root."
}
if (-not (Test-Path -LiteralPath $patchCss)) {
    throw 'Could not find portfolio-layout-fix.css beside this script.'
}

$currentCss = Get-Content -LiteralPath $globalCss -Raw
if ($currentCss.Contains($marker)) {
    Write-Host 'Portfolio and logout CSS patch is already present. No duplicate was added.' -ForegroundColor Yellow
} else {
    $addition = Get-Content -LiteralPath $patchCss -Raw
    Add-Content -LiteralPath $globalCss -Value "`r`n`r`n$addition" -Encoding utf8
    Write-Host 'Portfolio layout and logout styles appended to app\globals.css.' -ForegroundColor Green
}

Remove-Item -LiteralPath $patchCss -Force
Write-Host 'Done. The updated components\app-shell.tsx is already in place.' -ForegroundColor Green
