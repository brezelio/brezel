param (
    [string]$title,
    [string]$text
)

$job = Start-Job -WorkingDirectory $PSScriptRoot -Name "brezelNotification" -ScriptBlock {
    Add-Type -AssemblyName System.Windows.Forms
    $global:balloon = New-Object System.Windows.Forms.NotifyIcon
    $balloon.Icon = New-Object System.Drawing.Icon("$PWD\assets\brezel.ico")
    $balloon.BalloonTipText = $using:text
    $balloon.BalloonTipTitle = $using:title
    $balloon.Visible = $true
    $balloon.ShowBalloonTip(6000)
    sleep 7
    $balloon.Dispose()
    Get-Job
    Get-Job -Name "brezelNotification" | Remove-Job
}

Register-ObjectEvent -InputObject $job -EventName StateChanged -Action {
    Unregister-Event $EventSubscriber.SourceIdentifier
    Remove-Job $EventSubscriber.SourceIdentifier
    Remove-Job -Id $EventSubscriber.SourceObject.Id
} | Out-Null;
