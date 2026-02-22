param([string]$ApiBase = "http://localhost:8080")
Write-Host "Simulate DB slowness/read-only externally, then verify health and error handling"
Invoke-RestMethod -Method Get -Uri "$ApiBase/api/internal/health"
