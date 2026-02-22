pwsh ./scripts/security/check-secrets.ps1
if ($LASTEXITCODE -ne 0) { exit 1 }
./mvnw -q -f api/pom.xml test
if ($LASTEXITCODE -ne 0) { exit 1 }
Write-Host "Release gate checks passed"
