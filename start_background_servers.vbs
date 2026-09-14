' AntiTravel 24/7 Silent Background Launcher Script
Set WshShell = CreateObject("WScript.Shell")

' 1. Start Backend Express Server on port 5000 in background (window hidden = 0)
WshShell.Run "cmd /c cd /d ""c:\Users\Nanip\OneDrive\Documents\anti travel\server"" && node src/server.js", 0, False

' 2. Start Frontend Vite Server on port 5173 in background (window hidden = 0)
WshShell.Run "cmd /c cd /d ""c:\Users\Nanip\OneDrive\Documents\anti travel\client"" && npx vite --port 5173", 0, False

' 3. Open Website in default browser
WScript.Sleep 2000
WshShell.Run "http://localhost:5173/"
