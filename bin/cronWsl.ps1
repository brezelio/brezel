function wslifyPath {
    param (
        [Parameter(Mandatory=$true, Position=0)]
        [string]$windowspath
    )

    # C: -> /mnt/c, E: -> /mnt/e
    $driveRegex = '([A-Z]):'
    $match = $windowspath -match $driveRegex
    [string]$upper = $Matches[1] #first capture group
    [string]$lower = $upper.ToLower()
    $path = [string]$windowspath.replace($upper + ":",$lower)
    $path = "/mnt/$path"

    $path = $path -replace "\\","/"  # backslash -> forward slash
    return $path
}


$brezelRoot = $PSScriptRoot -replace ".{4}$"

$pathToApi = wslifyPath $brezelRoot

$phpPath = wslifyPath (Get-Command -Syntax php)

# Build Command to remove Brezel Cron from crontab
$removeScheduleCrons = "crontab -l | grep -v '$pathToApi && $phpPath bakery schedule' | crontab -"

# Build command to append Brezel Cron. The Cron will run artisan schedule:run in brezel-api every minute
$croncmd = "cd $pathToApi && $phpPath bakery schedule >> $( wsl tty ) 2>&1"
$cronjob = "* * * * * /bin/bash -c \`"$cronCmd\`""
$createCronTab = "(crontab -l ; echo `'$cronjob`') | sort - | uniq - | crontab -"

'Registering Crontab...'
'  Removing Previous Brezel Crontab(s)...'
bash -c $removeScheduleCrons

'  Registering Brezel Crontab...'
bash -c $createCronTab
'Done.'

$killAndRunCron = 'sudo kill -9 $( cat /var/run/crond.pid ); sudo cron -f'
$startCron = "'Killing, then starting Cronjob.' && 'If a blinking cursor remains everything went ok.' && '`"kill`" might throw an error if WSL was just started.' && 'You will need to enter your sudo password:' && bash -c '$killAndRunCron'"
pwsh -c "$startCron"
