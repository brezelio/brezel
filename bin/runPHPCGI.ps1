# Enable FPM with multiple processes
$env:PHP_FCGI_MAX_REQUESTS = 0
$env:PHP_FCGI_CHILDREN = 5

$iniFile = ((php -i | find /i "Loaded Configuration File") -replace "Loaded Configuration File =>", "").Trim()

# Start fastcgi
Write-Host "Starting php-cgi on 127.0.0.1:8099 with 5 children and ini file at $iniFile" -ForegroundColor DarkGreen
php-cgi --php-ini $iniFile -b 127.0.0.1:8099
