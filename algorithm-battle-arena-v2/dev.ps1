#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Start Algorithm Battle Arena v2 locally — NO full Docker required.
    Starts only Postgres (via Docker infra-only compose), then runs the
    NestJS API and Next.js frontend natively with Node.js.

.DESCRIPTION
    Prerequisites:
      - Docker Desktop (or Docker Engine) running        — for Postgres
      - Node.js 18+  (nvm / nvm4w / direct install)
      - npm 9+

    What this script does:
      1. Starts postgres container via docker-compose.infra.yml
      2. Waits for Postgres to be ready
      3. Runs `prisma migrate deploy` (applies all migrations)
      4. Starts NestJS API  (npm run start:dev)  on port 5000
      5. Starts Next.js web (npm run dev)         on port 3000

    Judge0 / server-side code execution:
      The "Run" button works 100% client-side (no Judge0 needed).
      The "Submit" button calls the API which calls Judge0. If Judge0
      is not running, submissions will return an error but everything
      else works. To enable Judge0, see the comment at the bottom.

.PARAMETER SkipInfra
    Skip starting Docker infrastructure (Postgres). Use this if Postgres
    is already running locally.

.PARAMETER ApiOnly
    Start only the API (not the frontend).

.PARAMETER WebOnly
    Start only the frontend (not the API).

.EXAMPLE
    .\dev.ps1                  # Start everything
    .\dev.ps1 -SkipInfra       # Postgres already running, start app only
    .\dev.ps1 -ApiOnly         # API only
    .\dev.ps1 -WebOnly         # Frontend only
#>

param(
    [switch]$SkipInfra,
    [switch]$ApiOnly,
    [switch]$WebOnly
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$apiDir = Join-Path $root "packages\api"
$webDir = Join-Path $root "packages\web"

# ── Helpers ──────────────────────────────────────────────────────────────────
function Write-Header($msg) { Write-Host "`n━━━  $msg  ━━━" -ForegroundColor Cyan }
function Write-OK($msg)     { Write-Host "  ✓  $msg" -ForegroundColor Green }
function Write-Info($msg)   { Write-Host "  ·  $msg" -ForegroundColor Gray }
function Write-Warn($msg)   { Write-Host "  ⚠  $msg" -ForegroundColor Yellow }
function Write-Err($msg)    { Write-Host "  ✗  $msg" -ForegroundColor Red }

function Test-Port($port) {
    try {
        $tcp = New-Object System.Net.Sockets.TcpClient
        $conn = $tcp.BeginConnect("127.0.0.1", $port, $null, $null)
        $waited = $conn.AsyncWaitHandle.WaitOne(500, $false)
        $tcp.Close()
        return $waited
    } catch { return $false }
}

function Wait-Port($port, $name, $maxSec = 60) {
    $elapsed = 0
    while (-not (Test-Port $port)) {
        if ($elapsed -ge $maxSec) {
            Write-Err "$name did not become available on port $port within ${maxSec}s"
            exit 1
        }
        Write-Info "Waiting for $name on port $port... ($elapsed/${maxSec}s)"
        Start-Sleep 3
        $elapsed += 3
    }
    Write-OK "$name is ready on port $port"
}

function Find-Node {
    # Try PATH first
    $n = Get-Command node -ErrorAction SilentlyContinue
    if ($n) { return $n.Source }
    # nvm4w common location
    if (Test-Path "C:\nvm4w\nodejs\node.exe") { return "C:\nvm4w\nodejs\node.exe" }
    # nvm common location
    $nvmDir = $env:NVM_DIR
    if ($nvmDir) {
        $latest = Get-ChildItem "$nvmDir\v*\node.exe" -ErrorAction SilentlyContinue | Sort-Object -Descending | Select-Object -First 1
        if ($latest) { return $latest.FullName }
    }
    Write-Err "Node.js not found. Install from https://nodejs.org or via nvm."
    exit 1
}

function Find-Npm {
    $nodeDir = Split-Path (Find-Node)
    $npmCmd = Join-Path $nodeDir "npm.cmd"
    if (Test-Path $npmCmd) { return $npmCmd }
    $npmCmd = Join-Path $nodeDir "npm"
    if (Test-Path $npmCmd) { return $npmCmd }
    $n = Get-Command npm -ErrorAction SilentlyContinue
    if ($n) { return $n.Source }
    Write-Err "npm not found."
    exit 1
}

function Invoke-Npm($dir, $args) {
    $npm = Find-Npm
    $nodeDir = Split-Path $npm
    $env:PATH = "$nodeDir;$env:PATH"
    Push-Location $dir
    try { & $npm @args }
    finally { Pop-Location }
}

# ── Step 1: Infrastructure (Postgres) ────────────────────────────────────────
if (-not $SkipInfra -and -not $WebOnly) {
    Write-Header "Starting Infrastructure (Postgres)"

    $dockerCmd = Get-Command docker -ErrorAction SilentlyContinue
    if (-not $dockerCmd) {
        Write-Warn "Docker not found in PATH. Checking common locations..."
        $dockerPaths = @(
            "C:\Program Files\Docker\Docker\resources\bin\docker.exe",
            "$env:LOCALAPPDATA\Docker\wsl\distro\usr\bin\docker"
        )
        $dockerExe = $dockerPaths | Where-Object { Test-Path $_ } | Select-Object -First 1
        if ($dockerExe) {
            $env:PATH = "$(Split-Path $dockerExe);$env:PATH"
            Write-OK "Found Docker at $dockerExe"
        } else {
            Write-Warn "Docker not found. Assuming Postgres is already running locally."
            Write-Info "If Postgres is not running, start it and rerun with -SkipInfra"
            $SkipInfra = $true
        }
    }

    if (-not $SkipInfra) {
        Push-Location $root
        Write-Info "Starting postgres container..."
        & docker compose -f docker-compose.infra.yml up -d postgres
        if ($LASTEXITCODE -ne 0) {
            Write-Warn "docker compose failed. Postgres may already be running."
        }
        Pop-Location
    }
}

# Wait for Postgres
if (-not $WebOnly) {
    Wait-Port 5432 "PostgreSQL"
}

# ── Step 2: Prisma migrate ────────────────────────────────────────────────────
if (-not $SkipInfra -and -not $WebOnly) {
    Write-Header "Running Prisma Migrations"
    Write-Info "Generating Prisma client..."
    Invoke-Npm $apiDir @("run", "prisma:generate")
    Write-Info "Deploying migrations..."
    # Use `migrate dev` for dev (creates migration if needed), `migrate deploy` for prod
    $env:DATABASE_URL = "postgresql://postgres:dev@localhost:5432/algorithm_battle_arena"
    Push-Location $apiDir
    $npm = Find-Npm
    $nodeDir = Split-Path $npm
    $env:PATH = "$nodeDir;$env:PATH"
    & $npm run prisma:migrate -- --name init 2>&1 | Out-String | ForEach-Object {
        if ($_ -match "error|Error") { Write-Warn $_ } else { Write-Info $_.Trim() }
    }
    Pop-Location
    Write-OK "Database schema ready"
}

# ── Step 3: Install dependencies ──────────────────────────────────────────────
Write-Header "Checking Dependencies"

$apiModules = Join-Path $apiDir "node_modules"
if (-not (Test-Path $apiModules)) {
    Write-Info "Installing API dependencies..."
    Invoke-Npm $apiDir @("install")
    Write-OK "API dependencies installed"
} else {
    Write-OK "API node_modules present"
}

$webModules = Join-Path $webDir "node_modules"
if (-not (Test-Path $webModules)) {
    Write-Info "Installing web dependencies..."
    Invoke-Npm $webDir @("install")
    Write-OK "Web dependencies installed"
} else {
    Write-OK "Web node_modules present"
}

# ── Step 4: Start API ─────────────────────────────────────────────────────────
$apiJob = $null
if (-not $WebOnly) {
    Write-Header "Starting NestJS API (port 5000)"
    $npm = Find-Npm
    $nodeDir = Split-Path $npm
    $apiJob = Start-Process -FilePath $npm `
        -ArgumentList "run", "start:dev" `
        -WorkingDirectory $apiDir `
        -PassThru `
        -NoNewWindow

    Write-Info "API process started (PID $($apiJob.Id)). Waiting for it to be ready..."
    Wait-Port 5000 "NestJS API" 120
}

# ── Step 5: Start Frontend ────────────────────────────────────────────────────
$webJob = $null
if (-not $ApiOnly) {
    Write-Header "Starting Next.js Frontend (port 3000)"
    $npm = Find-Npm
    $webJob = Start-Process -FilePath $npm `
        -ArgumentList "run", "dev" `
        -WorkingDirectory $webDir `
        -PassThru `
        -NoNewWindow

    Write-Info "Web process started (PID $($webJob.Id)). Waiting for it to be ready..."
    Wait-Port 3000 "Next.js" 120
}

# ── Done ──────────────────────────────────────────────────────────────────────
Write-Header "Algorithm Battle Arena v2 is Running!"
Write-Host ""
Write-Host "  🌐  Frontend  →  http://localhost:3000" -ForegroundColor Green
Write-Host "  ⚙️   API       →  http://localhost:5000/api" -ForegroundColor Green
Write-Host "  🗄️   Postgres  →  localhost:5432  (db: algorithm_battle_arena)" -ForegroundColor Gray
Write-Host ""
Write-Host "  Default admin: admin@aba.dev / admin123" -ForegroundColor Yellow
Write-Host ""
Write-Host "  Press Ctrl+C to stop all processes..." -ForegroundColor DarkGray
Write-Host ""

# ── Keep alive & cleanup on Ctrl+C ───────────────────────────────────────────
try {
    while ($true) { Start-Sleep 5 }
} finally {
    Write-Header "Shutting down..."
    if ($webJob -and -not $webJob.HasExited) {
        Write-Info "Stopping Next.js (PID $($webJob.Id))..."
        Stop-Process -Id $webJob.Id -Force -ErrorAction SilentlyContinue
    }
    if ($apiJob -and -not $apiJob.HasExited) {
        Write-Info "Stopping NestJS API (PID $($apiJob.Id))..."
        Stop-Process -Id $apiJob.Id -Force -ErrorAction SilentlyContinue
    }
    Write-OK "Done. Infrastructure (Postgres) left running."
    Write-Info "To stop Postgres: docker compose -f docker-compose.infra.yml down"
}

