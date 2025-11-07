# Скрипт для создания ZIP архива игры для публикации на Яндекс Играх
# Использование: .\create-yandex-zip.ps1

Write-Host "[*] Создание ZIP архива для публикации игры..." -ForegroundColor Cyan

# Имя архива с временной меткой
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$zipName = "numeric-duel-yandex-" + $timestamp + ".zip"
$tempDir = "game-build-temp"

# Очистка предыдущих версий
if (Test-Path $zipName) {
    Remove-Item $zipName -Force
    Write-Host "[+] Удален старый архив" -ForegroundColor Green
}

if (Test-Path $tempDir) {
    Remove-Item $tempDir -Recurse -Force
}

# Создание временной директории
New-Item -ItemType Directory -Path $tempDir | Out-Null
Write-Host "[+] Создана временная директория" -ForegroundColor Green

# Файлы для копирования
$filesToCopy = @(
    "index.html",
    "game.js",
    "i18n.js",
    "styles.css",
    "favicon.svg",
    "socket.io.min.js",
    "sdk.js"
)

# Копирование файлов
Write-Host "[*] Копирование файлов..." -ForegroundColor Yellow
foreach ($file in $filesToCopy) {
    if (Test-Path $file) {
        Copy-Item $file -Destination $tempDir -Force
        Write-Host "  [+] $file" -ForegroundColor Gray
    } else {
        Write-Host "  [!] Файл не найден: $file" -ForegroundColor Yellow
    }
}

# Проверка наличия index.html
if (-not (Test-Path "$tempDir\index.html")) {
    Write-Host "[X] ОШИБКА: index.html не найден!" -ForegroundColor Red
    Remove-Item $tempDir -Recurse -Force
    exit 1
}

# Создание ZIP архива
Write-Host "`n[*] Создание ZIP архива..." -ForegroundColor Yellow
Compress-Archive -Path "$tempDir\*" -DestinationPath $zipName -Force

# Очистка временной директории
Remove-Item $tempDir -Recurse -Force

# Проверка результата
if (Test-Path $zipName) {
    $zipSize = (Get-Item $zipName).Length / 1KB
    Write-Host "`n[+] УСПЕХ!" -ForegroundColor Green
    Write-Host "[*] Архив создан: $zipName" -ForegroundColor Cyan
    Write-Host "[*] Размер: $([math]::Round($zipSize, 2)) KB" -ForegroundColor Cyan
    Write-Host "`n[!] Архив готов для загрузки на Яндекс Игры!" -ForegroundColor Yellow
} else {
    Write-Host "`n[X] ОШИБКА: Не удалось создать архив!" -ForegroundColor Red
    exit 1
}

Write-Host "`nГотово!" -ForegroundColor Green
