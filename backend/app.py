from flask import Flask, jsonify
from flask_cors import CORS
from config import Config

app = Flask(__name__)
app.config.from_object(Config)

CORS(app, supports_credentials=True, origins=["*"])

app.config['SESSION_TYPE'] = 'filesystem'
app.config['PERMANENT_SESSION_LIFETIME'] = 86400

from routes import health, auth, resources, subjects, questions, answers, plans, progress, recommendations, comments

app.register_blueprint(health.bp)
app.register_blueprint(auth.bp)
app.register_blueprint(resources.bp)
app.register_blueprint(subjects.bp)
app.register_blueprint(questions.bp)
app.register_blueprint(answers.bp)
app.register_blueprint(plans.bp)
app.register_blueprint(progress.bp)
app.register_blueprint(recommendations.bp)
app.register_blueprint(comments.bp)


@app.errorhandler(404)
def not_found(error):
    return jsonify({"success": False, "message": "Not found"}), 404


@app.errorhandler(500)
def internal_error(error):
    return jsonify({"success": False, "message": "Internal server error"}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)