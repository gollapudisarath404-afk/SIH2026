import os
import sys
from pathlib import Path
import uvicorn

if __name__ == "__main__":
    backend_dir = Path(__file__).resolve().parent
    os.chdir(backend_dir)
    if str(backend_dir) not in sys.path:
        sys.path.insert(0, str(backend_dir))
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True, app_dir=str(backend_dir))

