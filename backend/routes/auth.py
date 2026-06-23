from flask import Blueprint, jsonify, request, session
from functools import wraps
from werkzeug.security import generate_password_hash, check_password_hash
import pymysql
from db import get_db
from models import serialize_row

bp = Blueprint('auth', __name__, url_prefix='/api/auth')


def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({"success": False, "message": "Not authenticated"}), 401
        return f(*args, **kwargs)
    return decorated_function


def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({"success": False, "message": "Not authenticated"}), 401

        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT role FROM users WHERE id = %s", (user_id,))
        row = cursor.fetchone()
        conn.close()

        if row is None or row['role'] != 'admin':
            return jsonify({"success": False, "message": "需要管理员权限"}), 403
        return f(*args, **kwargs)
    return decorated_function


@bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    username = data.get('username', '').strip()
    password = data.get('password', '')

    if not username or not password:
        return jsonify({"success": False, "message": "Username and password are required"}), 400

    if len(password) < 6:
        return jsonify({"success": False, "message": "Password must be at least 6 characters"}), 400

    password_hash = generate_password_hash(password)

    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO users (username, password_hash) VALUES (%s, %s)",
            (username, password_hash)
        )
        user_id = cursor.lastrowid
        conn.commit()
        conn.close()

        return jsonify({
            "success": True,
            "data": {"id": user_id, "username": username},
            "message": "User created"
        }), 201
    except pymysql.err.IntegrityError:
        return jsonify({"success": False, "message": "Username already exists"}), 400


@bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    username = data.get('username', '').strip()
    password = data.get('password', '')

    if not username or not password:
        return jsonify({"success": False, "message": "Username and password are required"}), 400

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id, username, password_hash FROM users WHERE username = %s", (username,))
    row = cursor.fetchone()
    conn.close()

    if row is None or not check_password_hash(row['password_hash'], password):
        return jsonify({"success": False, "message": "Invalid username or password"}), 401

    session['user_id'] = row['id']
    session.permanent = True

    return jsonify({
        "success": True,
        "data": {"id": row['id'], "username": row['username']},
        "message": "Login successful"
    }), 200


@bp.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({"success": True, "data": None, "message": "Logout successful"}), 200


@bp.route('/me', methods=['GET'])
def me():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"success": False, "message": "Not authenticated"}), 401

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id, username, role, created_at FROM users WHERE id = %s", (user_id,))
    row = cursor.fetchone()
    conn.close()

    if row is None:
        session.clear()
        return jsonify({"success": False, "message": "User not found"}), 404

    return jsonify({
        "success": True,
        "data": serialize_row(row),
        "message": ""
    }), 200