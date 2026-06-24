# API smoke test for civil-service-exam-tracker
$Base = 'http://localhost:5001/api'
$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$passed = 0
$failed = 0
$results = @()

function Test-Api {
    param(
        [string]$Name,
        [string]$Method = 'GET',
        [string]$Path,
        [object]$Body = $null,
        [int[]]$ExpectStatus = @(200),
        [switch]$RequireAuth
    )

    $uri = "$Base$Path"
    $params = @{
        Uri             = $uri
        Method          = $Method
        WebSession      = $session
        UseBasicParsing = $true
        ErrorAction     = 'Stop'
    }
    if ($Body -ne $null) {
        $params.ContentType = 'application/json'
        $params.Body = ($Body | ConvertTo-Json -Compress)
    }

    try {
        $resp = Invoke-WebRequest @params
        $ok = $ExpectStatus -contains $resp.StatusCode
        $json = $null
        try { $json = $resp.Content | ConvertFrom-Json } catch {}
        $successFlag = if ($json -and $null -ne $json.success) { $json.success } else { $true }
        if ($ok -and $successFlag) {
            $script:passed++
            $script:results += [pscustomobject]@{ Status = 'PASS'; Name = $Name; Code = $resp.StatusCode }
        } else {
            $script:failed++
            $script:results += [pscustomobject]@{ Status = 'FAIL'; Name = $Name; Code = $resp.StatusCode; Detail = $resp.Content.Substring(0, [Math]::Min(200, $resp.Content.Length)) }
        }
    } catch {
        $code = 0
        if ($_.Exception.Response) { $code = [int]$_.Exception.Response.StatusCode }
        $ok = $ExpectStatus -contains $code
        if ($ok) {
            $script:passed++
            $script:results += [pscustomobject]@{ Status = 'PASS'; Name = $Name; Code = $code }
        } else {
            $script:failed++
            $script:results += [pscustomobject]@{ Status = 'FAIL'; Name = $Name; Code = $code; Detail = $_.Exception.Message }
        }
    }
}

Write-Host "=== API Smoke Test ===" -ForegroundColor Cyan

Test-Api -Name 'health' -Path '/health'
Test-Api -Name 'health root' -Path '/health/'

Test-Api -Name 'me unauth' -Path '/auth/me' -ExpectStatus @(401)

Test-Api -Name 'login root' -Method POST -Path '/auth/login' -Body @{ username = 'root'; password = '123456' }
Test-Api -Name 'me auth' -Path '/auth/me' -RequireAuth

Test-Api -Name 'resources list' -Path '/resources/'
Test-Api -Name 'subjects list' -Path '/subjects/'
Test-Api -Name 'questions list' -Path '/questions/'
Test-Api -Name 'answers history' -Path '/answers/history'
Test-Api -Name 'plans goal' -Path '/plans/goal'
Test-Api -Name 'plans list' -Path '/plans/'
Test-Api -Name 'plans items' -Path '/plans/items'
Test-Api -Name 'plans subjects' -Path '/plans/subjects'
Test-Api -Name 'progress' -Path '/progress/?days=7'
Test-Api -Name 'recommendations' -Path '/recommendations/'

$qResp = Invoke-WebRequest -Uri "$Base/questions/?per_page=1" -WebSession $session -UseBasicParsing
$qJson = $qResp.Content | ConvertFrom-Json
$qId = $null
if ($qJson.success -and $qJson.data.items.Count -gt 0) { $qId = $qJson.data.items[0].id }

if ($qId) {
    Test-Api -Name 'question detail' -Path "/questions/$qId"
    Test-Api -Name 'comments list' -Path "/comments/?question_id=$qId"
    $correct = $qJson.data.items[0].correct_answer
    if ($correct) {
        Test-Api -Name 'submit answer' -Method POST -Path '/answers/' -Body @{ question_id = $qId; selected_answer = $correct }
    }
} else {
    $failed++
    $results += [pscustomobject]@{ Status = 'FAIL'; Name = 'question detail (no seed)'; Code = 0; Detail = 'No questions in DB' }
}

if ($qId) {
    Test-Api -Name 'post comment' -Method POST -Path '/comments/' -Body @{ question_id = $qId; content = 'API smoke test' } -ExpectStatus @(200, 201)
}

Test-Api -Name 'plans generate' -Method POST -Path '/plans/generate' -Body @{} -ExpectStatus @(200, 201)

Test-Api -Name 'logout' -Method POST -Path '/auth/logout'
Test-Api -Name 'me after logout' -Path '/auth/me' -ExpectStatus @(401)

Write-Host ""
$results | Format-Table -AutoSize
Write-Host "Passed: $passed  Failed: $failed" -ForegroundColor $(if ($failed -eq 0) { 'Green' } else { 'Yellow' })
if ($failed -gt 0) { exit 1 }