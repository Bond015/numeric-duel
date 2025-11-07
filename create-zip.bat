@echo off
powershell.exe -Command "Compress-Archive -Path index.html,game.js,i18n.js,styles.css,favicon.svg,socket.io.min.js -DestinationPath numeric-duel-yandex-new.zip -Force"
if exist numeric-duel-yandex-new.zip (
    echo SUCCESS: Archive created - numeric-duel-yandex-new.zip
    powershell.exe -Command "$size = (Get-Item 'numeric-duel-yandex-new.zip').Length / 1KB; Write-Host \"Size: $([math]::Round($size, 2)) KB\""
) else (
    echo ERROR: Archive not created
)
