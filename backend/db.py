import pymysql
from pymysql.cursors import DictCursor
from flask import current_app


def get_db():
    return pymysql.connect(
        host=current_app.config['MYSQL_HOST'],
        port=current_app.config['MYSQL_PORT'],
        user=current_app.config['MYSQL_USER'],
        password=current_app.config['MYSQL_PASSWORD'],
        database=current_app.config['MYSQL_DATABASE'],
        charset='utf8mb4',
        cursorclass=DictCursor,
        autocommit=False,
    )


def get_mysql_connection(database=None):
    """Standalone connection for init scripts (no Flask app context)."""
    from config import Config

    kwargs = {
        'host': Config.MYSQL_HOST,
        'port': Config.MYSQL_PORT,
        'user': Config.MYSQL_USER,
        'password': Config.MYSQL_PASSWORD,
        'charset': 'utf8mb4',
        'cursorclass': DictCursor,
        'autocommit': False,
    }
    if database:
        kwargs['database'] = database
    return pymysql.connect(**kwargs)