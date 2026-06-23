import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE_PATH = os.path.join(BASE_DIR, 'database.db')
SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')

class Config:
    SECRET_KEY = SECRET_KEY
    DATABASE = DATABASE_PATH
    DEBUG = True
