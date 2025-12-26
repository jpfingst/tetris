from flask import Flask, request, jsonify
from flask_cors import CORS
import jwt
from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps
from datetime import datetime, timedelta
import os

from .db import init_db, add_user, find_user_by_username, add_score, top_scores

app = Flask(__name__)
CORS(app)

SECRET = os.environ.get('TC_SECRET', 'dev-secret-change-me')
TOKEN_EXP_MIN = 60 * 24 * 7

init_db()

def auth_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth = request.headers.get('Authorization', '')
        if not auth.startswith('Bearer '):
            return jsonify({'error': 'missing token'}), 401
        token = auth.split(' ', 1)[1]
        try:
            payload = jwt.decode(token, SECRET, algorithms=['HS256'])
            request.user = payload
        except Exception:
            return jsonify({'error': 'invalid token'}), 401
        return f(*args, **kwargs)
    return decorated

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    username = (data.get('username') or '').strip()
    password = data.get('password') or ''
    if not username or not password:
        return jsonify({'error': 'username and password required'}), 400
    existing = find_user_by_username(username)
    if existing:
        return jsonify({'error': 'username taken'}), 400
    pwd_hash = generate_password_hash(password)
    uid = add_user(username, pwd_hash)
    if not uid:
        return jsonify({'error': 'could not create user'}), 500
    token = jwt.encode({'user_id': uid, 'username': username, 'exp': datetime.utcnow() + timedelta(minutes=TOKEN_EXP_MIN)}, SECRET, algorithm='HS256')
    return jsonify({'token': token})

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    username = (data.get('username') or '').strip()
    password = data.get('password') or ''
    u = find_user_by_username(username)
    if not u or not check_password_hash(u['password_hash'], password):
        return jsonify({'error': 'invalid credentials'}), 401
    token = jwt.encode({'user_id': u['id'], 'username': u['username'], 'exp': datetime.utcnow() + timedelta(minutes=TOKEN_EXP_MIN)}, SECRET, algorithm='HS256')
    return jsonify({'token': token})

@app.route('/api/me', methods=['GET'])
@auth_required
def me():
    return jsonify({'user_id': request.user['user_id'], 'username': request.user['username']})

@app.route('/api/score', methods=['POST'])
@auth_required
def submit_score():
    data = request.get_json() or {}
    score = int(data.get('score') or 0)
    if score < 0:
        return jsonify({'error': 'invalid score'}), 400
    add_score(request.user['user_id'], score)
    return jsonify({'ok': True})

@app.route('/api/leaderboard', methods=['GET'])
def leaderboard():
    top = top_scores(10)
    return jsonify({'top': top})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
