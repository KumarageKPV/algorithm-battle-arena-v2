#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Stop all local dev processes and optionally tear down infrastructure.

.EXAMPLE
    .\stop.ps1           # Kill node processes only (Postgres stays up)
    .\stop.ps1 -All      # Kill node processes AND stop Postgres container
#>

param([switch]$All)

$root = Split-Path -Parent $MyInvocation.MyCommand.Path

function Write-OK($msg)   { Write-Host "  ✓  $msg" -ForegroundColor Green }
function Write-Info($msg) { Write-Host "  ·  $msg" -ForegroundColor Gray }

Write-Host "`n━━━  Stopping ABA Dev Processes  ━━━" -ForegroundColor Cyan

# Kill any node process running from our project directories
Get-WmiObject Win32_Process -Filter "Name='node.exe'" | ForEach-Object {
    $cmdLine = $_.CommandLine
    if ($cmdLine -match "algorithm-battle-arena-v2") {
        Write-Info "Killing node PID $($_.ProcessId): $($cmdLine.Substring(0, [Math]::Min(80, $cmdLine.Length)))..."
        Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue
        Write-OK "Stopped PID $($_.ProcessId)"
    }
}

if ($All) {
    Write-Host "`n━━━  Stopping Infrastructure  ━━━" -ForegroundColor Cyan
    Push-Location $root
    docker compose -f docker-compose.infra.yml down
    Pop-Location
    Write-OK "Postgres container stopped"
} else {
    Write-Info "Postgres container left running (use -All to stop it too)"
    Write-Info "To stop manually: docker compose -f docker-compose.infra.yml down"
}

Write-Host "`n  Done." -ForegroundColor Green

