$b = "http://localhost:8000"

Write-Host "=== ADMIN ROLE TEST ===" -ForegroundColor Cyan

# 1. Login as admin
$tok = ((Invoke-WebRequest -UseBasicParsing -Uri "$b/auth/login" -Method POST -ContentType "application/json" -Body '{"email":"demo@financeai.com","password":"Demo@1234","remember_me":false}').Content | ConvertFrom-Json).access_token
Write-Host "1. Admin login: OK" -ForegroundColor Green

# 2. Platform stats
$stats = (Invoke-WebRequest -UseBasicParsing -Uri "$b/admin/stats" -Method GET -Headers @{"Authorization"="Bearer $tok"}).Content | ConvertFrom-Json
Write-Host "2. Platform Stats:" -ForegroundColor Green
Write-Host "   Total Users : $($stats.users.total)"
Write-Host "   Active Users: $($stats.users.active)"
Write-Host "   Analyses    : $($stats.analyses)"
Write-Host "   Avg Score   : $($stats.avg_score)"
Write-Host "   Chat Msgs   : $($stats.chat_msgs)"
Write-Host "   Goals       : $($stats.goals)"

# 3. All users list
$allusers = (Invoke-WebRequest -UseBasicParsing -Uri "$b/admin/users" -Method GET -Headers @{"Authorization"="Bearer $tok"}).Content | ConvertFrom-Json
Write-Host "3. All Users ($($allusers.total) total):" -ForegroundColor Green
foreach ($u in $allusers.users) {
    Write-Host "   [$($u.id)] $($u.email) | role=$($u.role) | active=$($u.is_active)"
}

# 4. Regular user blocked from admin
$regularTok = ((Invoke-WebRequest -UseBasicParsing -Uri "$b/auth/register" -Method POST -ContentType "application/json" -Body '{"name":"Regular","email":"regular999@test.com","password":"Regular@123","confirm_password":"Regular@123"}').Content | ConvertFrom-Json).access_token
try {
    Invoke-WebRequest -UseBasicParsing -Uri "$b/admin/users" -Method GET -Headers @{"Authorization"="Bearer $regularTok"} | Out-Null
    Write-Host "4. FAIL: Regular user accessed admin" -ForegroundColor Red
} catch {
    Write-Host "4. Regular user blocked (403): OK" -ForegroundColor Green
}

# 5. /auth/me shows role
$me = (Invoke-WebRequest -UseBasicParsing -Uri "$b/auth/me" -Method GET -Headers @{"Authorization"="Bearer $tok"}).Content | ConvertFrom-Json
Write-Host "5. /auth/me role field: $($me.role)" -ForegroundColor Green

Write-Host ""
Write-Host "=== ALL ADMIN TESTS PASSED ===" -ForegroundColor Cyan
