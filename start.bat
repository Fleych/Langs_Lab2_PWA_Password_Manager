@echo off
start http://localhost:8000
echo app runs at http://localhost:8000
python -m http.server 8000