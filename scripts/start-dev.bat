@echo off
REM =============================================================================
REM InamiMapApp 開発環境起動スクリプト (Windows)
REM =============================================================================
REM
REM このスクリプトはDocker経由でFirebase Emulatorsを起動し、
REM シードデータを投入して開発環境を構築します。
REM
REM 使用方法:
REM   scripts\start-dev.bat           エミュレータを起動
REM   scripts\start-dev.bat --seed    エミュレータを起動してシードデータを投入
REM   scripts\start-dev.bat --web     Web版の開発サーバーも起動
REM   scripts\start-dev.bat --clean   データをクリアして再起動
REM
REM =============================================================================

setlocal enabledelayedexpansion

set SCRIPT_DIR=%~dp0
set PROJECT_ROOT=%SCRIPT_DIR%..

REM オプション解析
set SEED_DATA=false
set START_WEB=false
set CLEAN_START=false

:parse_args
if "%~1"=="" goto main
if "%~1"=="--seed" (
    set SEED_DATA=true
    shift
    goto parse_args
)
if "%~1"=="--web" (
    set START_WEB=true
    shift
    goto parse_args
)
if "%~1"=="--clean" (
    set CLEAN_START=true
    shift
    goto parse_args
)
if "%~1"=="--help" goto show_help
if "%~1"=="-h" goto show_help
echo [ERROR] Unknown option: %~1
exit /b 1

:show_help
echo 使用方法: %~nx0 [オプション]
echo.
echo オプション:
echo   --seed    シードデータを投入
echo   --web     Web版の開発サーバーも起動
echo   --clean   データをクリアして再起動
echo   --help    このヘルプを表示
exit /b 0

:main
echo.
echo ==============================================
echo   井波マップアプリ 開発環境
echo   InamiMapApp Development Environment
echo ==============================================
echo.

cd /d "%PROJECT_ROOT%"

REM クリーンスタートの場合
if "%CLEAN_START%"=="true" (
    echo [INFO] Cleaning up existing data...
    docker compose down -v 2>nul
)

REM Docker Composeでエミュレータを起動
echo [INFO] Starting Firebase Emulators with Docker...
docker compose up -d

REM エミュレータの起動を待機
echo [INFO] Waiting for emulators to start...
timeout /t 15 /nobreak >nul

REM ヘルスチェック - Dockerコンテナのログを確認
set RETRY=0
:health_check
set /a RETRY+=1
docker logs inamimapapp-firebase-emulators-1 2>&1 | findstr /C:"All emulators ready" >nul 2>&1
if %errorlevel%==0 (
    echo [SUCCESS] Firebase Emulators are ready!
    goto emulators_ready
)
if %RETRY% geq 20 (
    echo [WARNING] Emulators may still be starting. Check status with: docker logs inamimapapp-firebase-emulators-1
    echo [INFO] Attempting to continue anyway...
    goto emulators_ready
)
timeout /t 3 /nobreak >nul
goto health_check

:emulators_ready

REM シードデータの投入
if "%SEED_DATA%"=="true" (
    echo [INFO] Seeding Firestore with demo data...
    cd /d "%PROJECT_ROOT%\scripts"
    call npm install --silent
    call npm run seed
    cd /d "%PROJECT_ROOT%"
    echo [SUCCESS] Seed data imported!
)

REM Web版の開発サーバーを起動
if "%START_WEB%"=="true" (
    echo [INFO] Starting web development server...
    cd /d "%PROJECT_ROOT%\web"
    call npm install --silent
    start cmd /c "npm run dev"
    cd /d "%PROJECT_ROOT%"
)

REM 接続情報を表示
echo.
echo ==============================================
echo   開発環境が起動しました
echo ==============================================
echo.
echo Firebase Emulator UI: http://localhost:4000
echo Firestore:            localhost:8080
echo Auth:                 localhost:9099
echo Storage:              localhost:9199
echo Functions:            localhost:5001
echo.
if "%START_WEB%"=="true" (
    echo Web Admin:            http://localhost:5173
    echo.
)
echo 停止するには: docker compose down
echo.

endlocal
