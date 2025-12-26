import sqlite3
from datetime import datetime
from pathlib import Path

DB_PATH = Path(__file__).resolve().parent / 'db.sqlite3'

def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        '''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
        '''
    )
    cur.execute(
        '''
        CREATE TABLE IF NOT EXISTS scores (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            score INTEGER NOT NULL,
            created_at TEXT NOT NULL,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )
        '''
    )
    conn.commit()
    conn.close()

def add_user(username, password_hash):
    conn = get_conn()
    cur = conn.cursor()
    now = datetime.utcnow().isoformat()
    try:
        cur.execute('INSERT INTO users (username, password_hash, created_at) VALUES (?, ?, ?)', (username, password_hash, now))
        conn.commit()
        uid = cur.lastrowid
    except Exception:
        uid = None
    conn.close()
    return uid

def find_user_by_username(username):
    conn = get_conn()
    cur = conn.cursor()
    cur.execute('SELECT * FROM users WHERE username = ?', (username,))
    row = cur.fetchone()
    conn.close()
    return dict(row) if row else None

def add_score(user_id, score):
    conn = get_conn()
    cur = conn.cursor()
    now = datetime.utcnow().isoformat()
    cur.execute('INSERT INTO scores (user_id, score, created_at) VALUES (?, ?, ?)', (user_id, score, now))
    conn.commit()
    conn.close()

def top_scores(limit=10):
    conn = get_conn()
    cur = conn.cursor()
    cur.execute('''
        SELECT s.score, s.created_at, u.username
        FROM scores s
        JOIN users u ON s.user_id = u.id
        ORDER BY s.score DESC, s.created_at ASC
        LIMIT ?
    ''', (limit,))
    rows = cur.fetchall()
    conn.close()
    return [dict(r) for r in rows]
