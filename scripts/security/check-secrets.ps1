param([string]$Path = ".")
$patterns = @(
  "AKIA[0-9A-Z]{16}",
  "(?i)secret\s*[:=]\s*['\"][^'\"]{8,}['\"]",
  "(?i)password\s*[:=]\s*['\"][^'\"]{6,}['\"]",
  "-----BEGIN (RSA|EC|OPENSSH|PRIVATE)"
)
$files = Get-ChildItem -Path $Path -Recurse -File | Where-Object { $_.FullName -notmatch "node_modules|target|.next" }
$hits = @()
foreach ($f in $files) {
  $content = Get-Content $f.FullName -Raw -ErrorAction SilentlyContinue
  foreach ($p in $patterns) {
    if ($content -match $p) { $hits += "$($f.FullName): pattern $p" }
  }
}
if ($hits.Count -gt 0) {
  $hits | ForEach-Object { Write-Host $_ }
  throw "Secret scan failed"
}
Write-Host "Secret scan passed"
