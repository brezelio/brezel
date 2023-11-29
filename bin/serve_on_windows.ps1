param (
    [Parameter(Mandatory=$false, Position=0)]
    [string]$noNginx
)

$maximizedAndOwnWindow = "-M -w 0"
$brezelRoot = $PSScriptRoot -replace ".{4}$"
$cdBrezel = "cd $brezelRoot"
$cdBrezelTools = "cd C:\Code\brezel"
$title = "--title"
# powershell that will not exit the pane after command completion
$pwsh = "pwsh -noexit -c"
# powershell with no profile for faster startup
$pwshNP = "pwsh --noprofile -noexit -c"

# whether to use nginx
$useNginx = $false
try {
    if ($noNginx) {
        throw
    }
    $nginxCommand = Get-Command -Syntax nginx -ErrorAction Stop
    $nginxPath = ($nginxCommand -replace '\\','/') -replace '/nginx.exe',''
    Write-Host "Starting with nginx" -ForegroundColor DarkGreen
    $useNginx = $true
} catch {
    Write-Host "Starting without nginx. Consider installing nginx in your path for better performance. The install location must not contain spaces. `n(e.g. 'C:/nginx' is good while 'C:/Programm Files/...' would not work.)" -ForegroundColor DarkRed
}

# Define Commands
$runSpa = "npm run serve"
$runBrotcast = "npm run start"
$runQueue = "php bakery work --sleep=1"
$runBrotcastQueue = "php bakery work --sleep=1 --queue=brotcasts"
$runCron = "./bin/cronPowershell.ps1"
if ($useNginx)
{
    # Prepare nginx.conf and replace variables with real paths
    $env:NGINXPATH = $nginxPath -replace("\\", "/")
    $env:BREZELAPIPATH = "$brezelRoot" -replace("\\", "/")
    Get-Content "$brezelRoot/bin//assets/windows/nginx.example.conf" | ForEach-Object { [Environment]::ExpandEnvironmentVariables($_) } | Set-Content "$brezelRoot/bin//assets/windows/nginx.conf"

    $runApiNginx = -join(
    "Write-Host 'Starting api with nginx listening on 127.0.0.1:8081' -ForegroundColor DarkGreen && ",
    "`"nginx -p $nginxPath -e $brezelRoot/nginxerrors.log -c $brezelRoot/bin/assets/windows/nginx.conf`""
    )
    $runApiFastCGI = "./bin/runPHPCGI.ps1"
} else {
    $runApi = "php bakery serve --port 8081"
}

# Define what will run in each pane
$spa = "$title spa $pwshNP $cdBrezel && $runSpa"
$apiDir = "$title api-dir $pwsh $cdBrezel"
$brotcast = "$title brotcast $pwshNP $cdBrezelTools\brotcast-server && $runBrotcast"
$queue = "$title queue $pwshNP $cdBrezel && 'Queue listening...' && $runQueue"
$brotcastQueue = "$title queue $pwshNP $cdBrezel && 'Brotcast queue listening...' && $runBrotcastQueue"
$cronScheduler = "$title cron-scheduler $pwshNP $cdBrezel && $runCron"
if ($useNginx)
{
    $apiNginx = "$title apiNginx $pwshNP $cdBrezel && $runApiNginx"
    $apiFastCGI = "$title apiFastCGI $pwshNP $cdBrezel && $runApiFastCGI"
} else {
    $api = "$title api $pwshNP $cdBrezel && $runApi"
}


# Build Command that creates multiple panes in this layout:
#| spa        | empty window in |
#|------------| api dir         |
#| api        |                 |
#|------------|-----------------|
#| WS | Queue | queue  | cron   |

# Build lower left part of command that contains api (either 1 or 2 panes when using nginx) and brotcast
if ($useNginx)
{
    $lowerLeftSection = -join (
    "split-pane -H -s 0.66 $apiNginx; ",
    "split-pane -H -s 0.5 $brotcast; ",
    "move-focus up; ",
    "split-pane -s 0.5 $apiFastCGI; ",
    "move-focus down; ",
    "split-pane -s 0.5 $brotcastQueue; "
    )
} else {
    $lowerLeftSection = -join (
    "split-pane -H -s 0.66 $api; ",
    "split-pane -H -s 0.5 $brotcast; ",
    "split-pane -s 0.5 $brotcastQueue; "
    )
}

$Command = -join (
# maximize and run commands in own window
"$maximizedAndOwnWindow ",
"$spa; ",
"split-pane -s 0.65 $apiDir; ",
"move-focus left;",
"$lowerLeftSection",
"move-focus right;",
"split-pane -H -s 0.33 $queue; ",
"split-pane -s 0.5 $cronScheduler"
)

Start-Process -NoNewWindow wt "$Command"
