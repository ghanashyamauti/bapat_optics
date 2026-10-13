# Bapat Optics - Start All Services Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Starting Bapat Optics Luxury Ecosystem " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# 1. Start Backend API (Port 8000)
Write-Host "[1/4] Launching FastAPI Backend on http://127.0.0.1:8000..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; .\venv\Scripts\Activate.ps1; python run.py"

# 2. Start Storefront (Port 5173)
Write-Host "[2/4] Launching Storefront on http://localhost:5173..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\store'; npm run dev"

# 3. Start Admin CRM (Port 5174)
Write-Host "[3/4] Launching Admin CRM on http://localhost:5174..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\admin'; npm run dev"

# 4. Start Landing Page (Port 3000)
Write-Host "[4/4] Launching Landing Page on http://localhost:3000..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\bapat-optics-landing'; `$env:NAPI_RS_FORCE_WASI='true'; npm run dev -- --port 3000"

Write-Host ""
Write-Host "All 4 services are starting in dedicated terminal windows." -ForegroundColor Cyan
Write-Host "  • Backend API:  http://127.0.0.1:8000 (Swagger: http://127.0.0.1:8000/docs)" -ForegroundColor White
Write-Host "  • Storefront:   http://localhost:5173" -ForegroundColor White
Write-Host "  • Admin CRM:    http://localhost:5174" -ForegroundColor White
Write-Host "  • Landing Page: http://localhost:3000" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
