@echo off
echo Starting InstaLingo Application...
echo.

echo Starting Flask backend server...
start cmd /k "cd Backend && python app.py"

echo.
echo Starting React frontend...
start cmd /k "cd Fortend && npm install && npm start"

echo.
echo InstaLingo is running!
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Press any key to shut down all components...

pause > nul
taskkill /f /im cmd.exe /fi "windowtitle eq *python*"
taskkill /f /im cmd.exe /fi "windowtitle eq *npm*"
echo InstaLingo has been shut down.