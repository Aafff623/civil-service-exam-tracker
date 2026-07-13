@echo off
setlocal enabledelayedexpansion
title 公务员考试学习跟踪系统 - Mock 演示模式

echo ============================================
echo   公务员考试学习跟踪系统
echo   前端 Mock 演示模式（无需 MySQL / Flask）
echo ============================================
echo.

:: 检测 Python 命令（优先 python，其次 py）
set "PYTHON_CMD="
where python >nul 2>nul
if !errorlevel! equ 0 set "PYTHON_CMD=python"

if not defined PYTHON_CMD (
    where py >nul 2>nul
    if !errorlevel! equ 0 set "PYTHON_CMD=py"
)

:: 如果找到命令，进一步确认是 Python 3
if defined PYTHON_CMD (
    for /f "tokens=2 delims= " %%a in ('%PYTHON_CMD% --version 2^>^&1') do set "PY_VERSION=%%a"
    echo !PY_VERSION! | findstr /B "3\." >nul 2>nul
    if !errorlevel! neq 0 set "PYTHON_CMD="
)

if not defined PYTHON_CMD goto need_python
goto have_python

:need_python
echo [提示] 未检测到 Python 3.x。
echo.
echo 本项目需要 Python 3.x 来启动本地静态服务器。
echo.
echo 请选择操作：
echo   [1] 自动下载并安装 Python 3.12（需要管理员权限和网络）
echo   [2] 退出，手动安装 Python 后再运行
echo.
choice /c 12 /n /m "输入 1 或 2 后按回车: "
if !errorlevel! equ 1 goto install_python
if !errorlevel! equ 2 goto manual_python

:manual_python
echo.
echo 已退出。请按以下步骤手动安装：
echo   1. 访问 https://www.python.org/downloads/
echo   2. 下载 Python 3.12（Windows installer 64-bit）
echo   3. 安装时勾选 "Add python.exe to PATH"
echo   4. 重新运行本脚本
echo.
pause
exit /b 0

:install_python
set "INSTALLER_URL=https://www.python.org/ftp/python/3.12.4/python-3.12.4-amd64.exe"
set "INSTALLER_PATH=%TEMP%\python-3.12.4-amd64.exe"

echo.
echo 正在从官方源下载 Python 3.12 安装程序...
echo   URL: %INSTALLER_URL%
echo.

powershell -NoProfile -ExecutionPolicy Bypass -Command "try { Invoke-WebRequest -Uri '%INSTALLER_URL%' -OutFile '%INSTALLER_PATH%' -UseBasicParsing } catch { exit 1 }"
if !errorlevel! neq 0 (
    echo.
    echo [错误] 下载失败，请检查网络连接或手动安装。
    echo 手动下载地址：https://www.python.org/downloads/release/python-3124/
    echo.
    pause
    exit /b 1
)

echo [OK] 下载完成，开始安装（需要管理员权限）...
echo.
start /wait "" "%INSTALLER_PATH%" /quiet InstallAllUsers=1 PrependPath=1 Include_test=0 InstallLauncherAllUsers=1
if !errorlevel! neq 0 (
    echo.
    echo [错误] 安装失败，请尝试右键以管理员身份运行本脚本，或手动安装。
    echo.
    pause
    exit /b 1
)

echo.
echo [OK] Python 3.12 安装完成。
echo.
echo 注意：安装程序已更新系统 PATH，当前窗口无法立即识别。
echo 请关闭本窗口，重新双击运行 quickstart-mock.bat。
echo.
pause
exit /b 0

:have_python
echo [OK] 检测到 Python !PY_VERSION!

:: 检测 8080 端口是否被占用
netstat -ano | findstr ":8080" | findstr "LISTENING" >nul 2>nul
if !errorlevel! equ 0 (
    echo.
    echo [警告] 端口 8080 已被占用。
    echo 请关闭占用 8080 端口的程序后重试。
    echo.
    pause
    exit /b 1
)

echo.
echo 正在启动前端服务，端口 8080...
echo 启动后请访问：http://localhost:8080/login.html
echo.
echo 默认演示账号：root / 123456
echo.
echo 提示：
echo   - 此模式使用本地模拟数据，不依赖后端和数据库
echo   - 如需真实后端，请单独启动 backend/app.py
echo   - 按 Ctrl+C 停止服务
echo.

cd /d "%~dp0frontend"
start "" "http://localhost:8080/login.html"
%PYTHON_CMD% -m http.server 8080

pause
exit /b 0