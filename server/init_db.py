import os
import subprocess
from flask import Flask
from dotenv import load_dotenv
from sqlalchemy import text

from database import db

load_dotenv()

DATABASE_URL = os.getenv("POSTGRES_DSN")
CSV_PATH = "/seed/location_rows.csv"

def create_minimal_app():
    app = Flask(__name__)
    app.config["SQLALCHEMY_DATABASE_URI"] = DATABASE_URL
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    db.init_app(app)
    return app

def ensure_pgvector_extension():
    # pgvector type won't exist until extension is enabled
    with db.engine.begin() as conn:
        conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))

def seed_location_table():
    # Use \copy (client side) so the CSV only needs to exist in init container
    if not os.path.exists(CSV_PATH):
        print(f"⚠️ CSV not found at {CSV_PATH}, skipping seed.")
        return

    cmd = [
        "psql",
        DATABASE_URL,
        "-v", "ON_ERROR_STOP=1",
        "-c", f'\\copy "location" FROM \'{CSV_PATH}\' WITH (FORMAT csv, HEADER true)'
    ]
    subprocess.run(cmd, check=True)
    print("Seeded location table")

if __name__ == "__main__":
    if not DATABASE_URL:
        raise RuntimeError("DATABASE_URL is not set")

    app = create_minimal_app()
    with app.app_context():
        print("==> Enabling pgvector extension...")
        ensure_pgvector_extension()

        print("==> Creating tables...")
        db.create_all()

        print("==> Seeding location table...")
        seed_location_table()

    print("init_db complete")
