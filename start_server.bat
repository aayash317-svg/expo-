@echo off
echo Stopping all existing Python processes...
taskkill /F /IM python.exe >nul 2>&1
echo Cleanup complete.

echo Starting NFC Health System (Flask)...
cd nfc-health-system

echo Installing requirements (if needed)...
pip install -r requirements.txt

echo Starting Flask App...
python app.py
pause
