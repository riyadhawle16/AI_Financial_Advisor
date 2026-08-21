$b = "http://localhost:8000"
$pass = 0
$fail = 0

function Test-Feature($name, $result) {
    if ($result) {
        Write-Host "  [PASS] $name" -ForegroundColor Green
        $script:pass++
    } else {
        Write-Host "  [FAIL] $name" -ForegroundColor Red
        $script:fail++
    }
}

Write-Host "`n=== FinanceAI Full Feature Test ===" -ForegroundColor Cyan

# 1. Health check
try {
    $r = (Invoke-WebRequest -UseBasicParsing -Uri "$b/" -Method GET).Content | ConvertFrom-Json
    Test-Feature "Health check (/)" ($r.message -like "*running*")
} catch { Test-Feature "Health check (/)" $false }

# 2. Register
$ts = Get-Date -Format "mmssff"
$email = "test${ts}@financeai.com"
try {
    $reg = (Invoke-WebRequest -UseBasicParsing -Uri "$b/auth/register" -Method POST -ContentType "application/json" -Body "{`"name`":`"Test User`",`"email`":`"$email`",`"password`":`"Test@Pass1`",`"confirm_password`":`"Test@Pass1`"}").Content | ConvertFrom-Json
    $tok = $reg.access_token
    Test-Feature "Register (/auth/register)" ($reg.user.email -eq $email)
} catch { Test-Feature "Register (/auth/register)" $false; $tok = $null }

# 3. Login
try {
    $login = (Invoke-WebRequest -UseBasicParsing -Uri "$b/auth/login" -Method POST -ContentType "application/json" -Body "{`"email`":`"$email`",`"password`":`"Test@Pass1`",`"remember_me`":false}").Content | ConvertFrom-Json
    Test-Feature "Login (/auth/login)" ($login.user.role -eq "user")
} catch { Test-Feature "Login (/auth/login)" $false }

# 4. /auth/me
try {
    $me = (Invoke-WebRequest -UseBasicParsing -Uri "$b/auth/me" -Method GET -Headers @{"Authorization"="Bearer $tok"}).Content | ConvertFrom-Json
    Test-Feature "Auth Me (/auth/me)" ($me.name -eq "Test User")
} catch { Test-Feature "Auth Me (/auth/me)" $false }

# 5. Analyze
try {
    $analyze = (Invoke-WebRequest -UseBasicParsing -Uri "$b/analyze" -Method POST -ContentType "application/json" -Headers @{"Authorization"="Bearer $tok"} -Body '{"income":80000,"expenses":45000,"savings":25000,"debt":50000,"risk_tolerance":"medium"}').Content | ConvertFrom-Json
    Test-Feature "Analyze (/analyze)" ($analyze.financial_score -gt 0 -and $analyze.analysis_id -gt 0)
    $score = $analyze.financial_score
} catch { Test-Feature "Analyze (/analyze)" $false; $score = 65 }

# 6. Forecast
try {
    $fc = (Invoke-WebRequest -UseBasicParsing -Uri "$b/forecast" -Method POST -ContentType "application/json" -Body '{"income":80000,"expenses":45000,"months":6}').Content | ConvertFrom-Json
    Test-Feature "Forecast (/forecast)" ($fc.forecast.Count -eq 6)
} catch { Test-Feature "Forecast (/forecast)" $false }

# 7. Simulate
try {
    $sim = (Invoke-WebRequest -UseBasicParsing -Uri "$b/simulate" -Method POST -ContentType "application/json" -Body '{"monthly_investment":5000,"years":10,"expected_return":12}').Content | ConvertFrom-Json
    Test-Feature "Simulate (/simulate)" ($sim.future_value -gt 100000)
} catch { Test-Feature "Simulate (/simulate)" $false }

# 8. Chat
try {
    $chat = (Invoke-WebRequest -UseBasicParsing -Uri "$b/chat" -Method POST -ContentType "application/json" -Headers @{"Authorization"="Bearer $tok"} -Body "{`"message`":`"What is SIP?`",`"risk_tolerance`":`"medium`",`"financial_score`":$score}").Content | ConvertFrom-Json
    Test-Feature "Chat (/chat)" ($chat.reply.Length -gt 10)
} catch { Test-Feature "Chat (/chat)" $false }

# 9. Goal Planner
try {
    $goal = (Invoke-WebRequest -UseBasicParsing -Uri "$b/goal-planner" -Method POST -ContentType "application/json" -Headers @{"Authorization"="Bearer $tok"} -Body '{"goal_name":"Buy Car","target_amount":800000,"years":3,"annual_return":12,"current_savings":50000}').Content | ConvertFrom-Json
    Test-Feature "Goal Planner (/goal-planner)" ($goal.required_monthly_sip -gt 0)
} catch { Test-Feature "Goal Planner (/goal-planner)" $false }

# 10. Portfolio
try {
    $port = (Invoke-WebRequest -UseBasicParsing -Uri "$b/portfolio" -Method POST -ContentType "application/json" -Headers @{"Authorization"="Bearer $tok"} -Body "{`"age`":25,`"risk_appetite`":`"medium`",`"financial_score`":$score}").Content | ConvertFrom-Json
    Test-Feature "Portfolio (/portfolio)" ($port.allocations.Count -gt 0)
} catch { Test-Feature "Portfolio (/portfolio)" $false }

# 11. Financial Twin
try {
    $twin = (Invoke-WebRequest -UseBasicParsing -Uri "$b/financial-twin" -Method POST -ContentType "application/json" -Headers @{"Authorization"="Bearer $tok"} -Body '{"income":80000,"expenses":45000,"savings":25000,"debt":50000,"risk_appetite":"medium","sip_amount":5000,"annual_return":12,"scenario_type":"sip_growth","scenario_parameters":{"sip_options":[5000,10000,15000],"labels":["5K","10K","15K"],"years":10}}').Content | ConvertFrom-Json
    Test-Feature "Financial Twin (/financial-twin)" ($twin.scenario_type -eq "sip_growth")
} catch { Test-Feature "Financial Twin (/financial-twin)" $false }

# 12. History Summary
try {
    $sum = (Invoke-WebRequest -UseBasicParsing -Uri "$b/history/summary" -Method GET -Headers @{"Authorization"="Bearer $tok"}).Content | ConvertFrom-Json
    Test-Feature "History Summary (/history/summary)" ($sum.analyses -gt 0)
} catch { Test-Feature "History Summary (/history/summary)" $false }

# 13. History Analyses
try {
    $ha = (Invoke-WebRequest -UseBasicParsing -Uri "$b/history/analyses" -Method GET -Headers @{"Authorization"="Bearer $tok"}).Content | ConvertFrom-Json
    Test-Feature "History Analyses (/history/analyses)" ($ha.total -gt 0)
} catch { Test-Feature "History Analyses (/history/analyses)" $false }

# 14. History Goals
try {
    $hg = (Invoke-WebRequest -UseBasicParsing -Uri "$b/history/goals" -Method GET -Headers @{"Authorization"="Bearer $tok"}).Content | ConvertFrom-Json
    Test-Feature "History Goals (/history/goals)" ($hg.total -gt 0)
} catch { Test-Feature "History Goals (/history/goals)" $false }

# 15. History Portfolios
try {
    $hp = (Invoke-WebRequest -UseBasicParsing -Uri "$b/history/portfolios" -Method GET -Headers @{"Authorization"="Bearer $tok"}).Content | ConvertFrom-Json
    Test-Feature "History Portfolios (/history/portfolios)" ($hp.total -gt 0)
} catch { Test-Feature "History Portfolios (/history/portfolios)" $false }

# 16. History Chat
try {
    $hc = (Invoke-WebRequest -UseBasicParsing -Uri "$b/history/chat" -Method GET -Headers @{"Authorization"="Bearer $tok"}).Content | ConvertFrom-Json
    Test-Feature "History Chat (/history/chat)" ($hc.total -ge 0)
} catch { Test-Feature "History Chat (/history/chat)" $false }

# 17. History Twin Runs
try {
    $ht = (Invoke-WebRequest -UseBasicParsing -Uri "$b/history/twin-runs" -Method GET -Headers @{"Authorization"="Bearer $tok"}).Content | ConvertFrom-Json
    Test-Feature "History Twin Runs (/history/twin-runs)" ($ht.total -gt 0)
} catch { Test-Feature "History Twin Runs (/history/twin-runs)" $false }

# 18. History Roadmaps
try {
    $hr = (Invoke-WebRequest -UseBasicParsing -Uri "$b/history/roadmaps" -Method GET -Headers @{"Authorization"="Bearer $tok"}).Content | ConvertFrom-Json
    Test-Feature "History Roadmaps (/history/roadmaps)" ($hr.total -gt 0)
} catch { Test-Feature "History Roadmaps (/history/roadmaps)" $false }

# 19. Admin stats (use demo admin account)
try {
    $adminLogin = (Invoke-WebRequest -UseBasicParsing -Uri "$b/auth/login" -Method POST -ContentType "application/json" -Body '{"email":"demo@financeai.com","password":"Demo@1234","remember_me":false}').Content | ConvertFrom-Json
    $adminTok = $adminLogin.access_token
    $stats = (Invoke-WebRequest -UseBasicParsing -Uri "$b/admin/stats" -Method GET -Headers @{"Authorization"="Bearer $adminTok"}).Content | ConvertFrom-Json
    Test-Feature "Admin Stats (/admin/stats)" ($stats.users.total -gt 0)
} catch { Test-Feature "Admin Stats (/admin/stats)" $false }

# 20. Regular user blocked from admin
try {
    Invoke-WebRequest -UseBasicParsing -Uri "$b/admin/stats" -Method GET -Headers @{"Authorization"="Bearer $tok"} | Out-Null
    Test-Feature "Admin blocked for regular users (403)" $false
} catch {
    Test-Feature "Admin blocked for regular users (403)" ($_.Exception.Response.StatusCode.value__ -eq 403)
}

# 21. Duplicate email rejected
try {
    Invoke-WebRequest -UseBasicParsing -Uri "$b/auth/register" -Method POST -ContentType "application/json" -Body "{`"name`":`"Dup`",`"email`":`"$email`",`"password`":`"Test@Pass1`",`"confirm_password`":`"Test@Pass1`"}" | Out-Null
    Test-Feature "Duplicate email rejected (409)" $false
} catch {
    Test-Feature "Duplicate email rejected (409)" ($_.Exception.Response.StatusCode.value__ -eq 409)
}

# 22. Chat status
try {
    $cs = (Invoke-WebRequest -UseBasicParsing -Uri "$b/chat/status" -Method GET).Content | ConvertFrom-Json
    Test-Feature "Chat Status (/chat/status)" ($cs.active_engine.Length -gt 0)
} catch { Test-Feature "Chat Status (/chat/status)" $false }

Write-Host "`n=== RESULTS: $pass passed, $fail failed ===" -ForegroundColor Cyan
if ($fail -eq 0) {
    Write-Host "ALL TESTS PASSED" -ForegroundColor Green
} else {
    Write-Host "$fail tests failed - check above" -ForegroundColor Red
}
