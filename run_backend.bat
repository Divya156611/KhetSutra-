@echo off
title KhetSutra Backend (FastAPI)
echo Starting KhetSutra Backend on http://127.0.0.1:8000 ...
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
pause
