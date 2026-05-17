@echo off
cd /d "%~dp0"

REM Check if port 3000 is already listening; start server only if not.
PowerShell -NoProfile -ExecutionPolicy Bypass -Command ^
  "try { $c=New-Object Net.Sockets.TcpClient; $c.Connect('127.0.0.1',3000); $c.Close() } catch { Start-Process -FilePath '%~dp0node_modules\.bin\http-server.cmd' -ArgumentList '.', '-p', '3000', '-c-1', '--silent' -WindowStyle Hidden }"

REM Give the server a moment if it was just started.
timeout /T 1 /NOBREAK >nul

REM Open the app in the default browser and exit immediately.
start "" http://127.0.0.1:3000
