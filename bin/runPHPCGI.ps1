# Enable FPM with multiple processes
$env:PHP_FCGI_MAX_REQUESTS = 0
$env:PHP_FCGI_CHILDREN = 5

# Start fastcgi
Write-Host 'Starting php-cgi on 127.0.0.1:8099 with 5 children' -ForegroundColor DarkGreen
php-cgi -b 127.0.0.1:8099
