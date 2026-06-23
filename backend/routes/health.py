from flask import Blueprint, jsonify

bp = Blueprint('health', __name__, url_prefix='/api/health')

@bp.route('', methods=['GET'])
def health_check():
    return jsonify({
        "success": True,
        "data": {"status": "ok"},
        "message": "Service is running"
    })

@bp.route('/', methods=['GET'])
def health_check_slash():
    return jsonify({
        "success": True,
        "data": {"status": "ok"},
        "message": "Service is running"
    })
