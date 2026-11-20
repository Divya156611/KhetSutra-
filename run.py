import os
import sys
import time
import subprocess
import webbrowser
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = ROOT_DIR / "backend"
FRONTEND_DIR = ROOT_DIR / "frontend"

def main():
    print("=" * 65)
    print("🌾 खेतसूत्र (KhetSutra) — Smart Farming. Smarter Decisions.")
    print("=" * 65)
    
    # 1. Start Backend
    print("\n[1/2] 🚀 Launching FastAPI Backend on http://127.0.0.1:8000 ...")
    backend_cmd = [sys.executable, "-m", "uvicorn", "backend.main:app", "--host", "127.0.0.1", "--port", "8000"]
    
    try:
        backend_proc = subprocess.Popen(
            backend_cmd,
            cwd=str(ROOT_DIR),
            env=os.environ.copy()
        )
    except Exception as e:
        print(f"❌ Failed to start backend: {e}")
        return

    # Give backend a moment to boot
    time.sleep(2)

    # 2. Start Frontend
    print("[2/2] 🌿 Launching Next.js Frontend on http://localhost:3000 ...")
    npm_cmd = "npm.cmd" if sys.platform == "win32" else "npm"
    frontend_cmd = [npm_cmd, "run", "dev"]

    try:
        frontend_proc = subprocess.Popen(
            frontend_cmd,
            cwd=str(FRONTEND_DIR),
            env=os.environ.copy(),
            shell=(sys.platform == "win32")
        )
    except Exception as e:
        print(f"❌ Failed to start frontend: {e}")
        backend_proc.terminate()
        return

    time.sleep(3)
    print("\n" + "=" * 65)
    print("✅ KhetSutra is LIVE!")
    print("👉 Frontend Application: http://localhost:3000")
    print("👉 Backend API Swagger:  http://127.0.0.1:8000/docs")
    print("Press Ctrl+C to stop both servers.")
    print("=" * 65 + "\n")

    try:
        webbrowser.open("http://localhost:3000")
    except Exception:
        pass

    try:
        while True:
            time.sleep(1)
            if backend_proc.poll() is not None:
                print("⚠️ Backend server stopped.")
                break
            if frontend_proc.poll() is not None:
                print("⚠️ Frontend server stopped.")
                break
    except KeyboardInterrupt:
        print("\n🛑 Shutting down KhetSutra servers...")
    finally:
        try:
            backend_proc.terminate()
        except Exception:
            pass
        try:
            frontend_proc.terminate()
        except Exception:
            pass
        print("Done. Goodbye!")

if __name__ == "__main__":
    main()
