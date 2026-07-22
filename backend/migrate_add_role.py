"""
One-time migration: adds role column to users table.
Safe to run multiple times — checks if column exists first.
"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
os.chdir(os.path.dirname(__file__))

from database import engine
from sqlalchemy import text

with engine.connect() as conn:
    cols = [row[1] for row in conn.execute(text("PRAGMA table_info(users)")).fetchall()]
    print("Existing columns:", cols)

    if "role" not in cols:
        conn.execute(text("ALTER TABLE users ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'user'"))
        conn.commit()
        print("SUCCESS: role column added")
    else:
        print("role column already exists — nothing to do")

print("Migration done.")
