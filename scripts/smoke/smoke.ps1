param(
  [string]$ApiBase = "http://localhost:8080",
  [string]$TenantId = "00000000-0000-0000-0000-000000000001"
)

$body = @{ email = "admin@local.dev"; password = "password" } | ConvertTo-Json
$login = Invoke-RestMethod -Method Post -Uri "$ApiBase/api/auth/login" -ContentType "application/json" -Body $body
$token = $login.accessToken
$headers = @{ Authorization = "Bearer $token"; "X-Tenant-Id" = $TenantId }

Invoke-RestMethod -Method Get -Uri "$ApiBase/api/internal/health" -Headers $headers | Out-Null
Invoke-RestMethod -Method Get -Uri "$ApiBase/admin/integration-status" -Headers $headers | Out-Null
Write-Host "Smoke passed"
