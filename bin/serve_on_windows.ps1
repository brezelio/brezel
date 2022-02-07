$maximizedAndOwnWindow = "-M -w 0"
$brezelRoot = $PSScriptRoot -replace ".{4}$"
$cdBrezel = "cd $brezelRoot"
$cdBrezelTools = "cd C:\Code\brezel"
$title = "--title"
# powershell that will not exit the pane after command completion
$pwsh = "pwsh -noexit -c"
# powershell with no profile for faster startup
$pwshNP = "pwsh --noprofile -noexit -c"

# Define Commands
$runSpa = "npm run serve"
$runApi = "php -S localhost:8081"
$runBrotcast = "php artisan websockets:serve --port=8086"
$runQueue = "php bakery work"
$runCron = "./bin/cronWSL.ps1"

# Define what will run in each pane
$spa = "$title spa $pwshNP $cdBrezel && $runSpa"
$apiDir = "$title api-dir $pwsh $cdBrezel"
$api = "$title api $pwshNP $cdBrezel\public && $runApi"
$brotcast = "$title brotcast $pwshNP $cdBrezelTools\brotcast-server && $runBrotcast"
$queue = "$title queue $pwshNP $cdBrezel && 'Queue listening...' && $runQueue"
$cronScheduler = "$title cron-scheduler $pwshNP $cdBrezel && $runCron"


# Build Command that creates multiple panes in this layout:
#| spa      | empty window in |
#|----------| api dir         |
#| api      |                 |
#|----------|-----------------|
#| brotcast | queue  | cron   |
$Command = -join (
# maximize and run commands in own window
"$maximizedAndOwnWindow ",
"$spa; ",
"split-pane -s 0.65 $apiDir; ",
"focus-pane -t 0 ; ",
"split-pane -H -s 0.66 $api; ",
"split-pane -H -s 0.5 $brotcast; ",
"focus-pane -t 1 ; ",
"split-pane -H -s 0.33 $queue; ",
"split-pane -s 0.5 $cronScheduler"
)

Start-Process wt "$Command"
