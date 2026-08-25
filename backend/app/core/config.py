import os

from dotenv import load_dotenv

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
load_dotenv(dotenv_path=os.path.join(BASE_DIR, ".env"))


class Settings:
    PROJECT_NAME: str = os.getenv("PROJECT_NAME", "SchemeSaathi AI")
    PROJECT_VERSION: str = "1.0.0"
    BASE_DIR: str = BASE_DIR
    SCHEMES_DATA_DIR: str = os.path.join(BASE_DIR, "data", "schemes")
    DATA_DIR: str = os.path.join(BASE_DIR, "data")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-3.6-flash")
    FRONTEND_ORIGIN: str = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")
    MONGODB_URI: str = os.getenv("MONGODB_URI", "")
    MONGODB_DB_NAME: str = os.getenv("MONGODB_DB_NAME", "schemesaathi")


settings = Settings()
