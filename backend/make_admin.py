"""
Run this once to promote your account to admin.
Usage: python make_admin.py your@email.com
"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
os.chdir(os.path.dirname(__file__))

if len(sys.argv) < 2:
    print("Usage: python make_admin.py your@email.com")
    sys.exit(1)

email = sys.argv[1].lower().strip()

from database import SessionLocal
from models.user_model import User

db = SessionLocal()
user = db.query(User).filter(User.email == email).first()

if not user:
    print(f"No user found with email: {email}")
    print("Register first at http://localhost:5173")
else:
    user.role = "admin"
    db.commit()
    print(f"SUCCESS: {user.name} ({user.email}) is now admin.")
    print(f"User ID: {user.id} | Role: {user.role}")

db.close()
