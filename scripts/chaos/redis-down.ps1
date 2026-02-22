param([string]$ApiBase = "http://localhost:8080")
Write-Host "Simulating Redis down: stop redis service/container manually then run health check"
Invoke-RestMethod -Method Get -Uri "$ApiBase/api/internal/health"
