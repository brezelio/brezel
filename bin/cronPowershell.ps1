while ($true) {
    Write-Host "Executing schedule..."
    & "php" bakery schedule

    # Pause the script for 60 second
    Start-Sleep -Seconds 60
}
