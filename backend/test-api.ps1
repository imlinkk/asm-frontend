$base = 'http://localhost:5000'

Set-Location $PSScriptRoot

try {
  Write-Output "Checking health..."
  $h = Invoke-RestMethod -Uri "$base/api/health" -Method Get -ErrorAction Stop
  Write-Output "Health: $($h.status)"
} catch {
  Write-Error "Health check failed: $_"
  exit 2
}

# Register
$rand = Get-Random -Minimum 10000 -Maximum 99999
$email = "ci_test_$rand@example.com"
$body = @{ name = 'CI User'; email = $email; password = 'Password123!' } | ConvertTo-Json

try {
  Write-Output "Registering $email..."
  $r = Invoke-RestMethod -Uri "$base/api/auth/register" -Method Post -Body $body -ContentType 'application/json' -ErrorAction Stop
  Write-Output "Registered. Token returned? $([bool]$r.token)"
} catch {
  Write-Error "Register failed: $_"
  exit 3
}

$token = $r.token
Write-Output "TOKEN:$token"

# Upload avatar using native curl.exe (Invoke-RestMethod -Form may be unavailable)
try {
  Write-Output "Uploading avatar via curl.exe..."
  $cmd = 'curl.exe -s -H "Authorization: Bearer ' + $token + '" -F "avatar=@test-avatar.png" "' + $base + '/api/auth/me/avatar"'
  Write-Output "Command: $cmd"
  $upload = Invoke-Expression $cmd
  Write-Output "Upload response: $upload"
} catch {
  Write-Error "Upload failed: $_"
  exit 4
}

try {
  Write-Output "Getting /auth/me..."
  $me = Invoke-RestMethod -Uri "$base/api/auth/me" -Method Get -Headers @{ Authorization = "Bearer $token" } -ErrorAction Stop
  Write-Output "Me: $($me.user | ConvertTo-Json -Compress)"
} catch {
  Write-Error "Get me failed: $_"
  exit 5
}

Write-Output "TEST COMPLETE"
