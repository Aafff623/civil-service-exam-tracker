import sqlite3
from flask import Flask, jsonify, request, session
from flask_cors import CORS
from config import Config

app = Flask(__name__)
app.config.from_object(Config)

# Enable CORS for local frontend (file:// origins)
CORS(app, supports_credentials=True, origins=["*"])

# Session config
app.config['SESSION_TYPE'] = 'filesystem'
app.config['PERMANENT_SESSION_LIFETIME'] = 86400  # 1 day

def get_db():
    conn = sqlite3.connect(app.config['DATABASE'])
    conn.row_factory = sqlite3.Row
    return conn

@app.teardown_appcontext
def close_db(exception):
    db = getattr(app, '_database', None)
    if db is not None:
        db.close()

# Register blueprints
from routes import health, auth, resources, subjects, questions, answers, plans

app.register_blueprint(health.bp)
app.register_blueprint(auth.bp)
app.register_blueprint(resources.bp)
app.register_blueprint(subjects.bp)
app.register_blueprint(questions.bp)
app.register_blueprint(answers.bp)
app.register_blueprint(plans.bp)

@app.errorhandler(404)
def not_found(error):
    return jsonify({"success": False, "message": "Not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"success": False, "message": "Internal server error"}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
