from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
from datetime import datetime
import os
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, 'sewer_database.db')

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS sensor_data (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sewer_id TEXT,
            gas_level REAL,
            water_level REAL,
            timestamp TEXT,
            risk_level TEXT,
            decision TEXT
        )
    ''')

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT UNIQUE,
            password TEXT
        )
    ''')

    conn.commit()
    conn.close()

init_db()

Gc = 200
Gw = 178
Wc = 70
Ww = 40

def calculate_risk(gas, water):
    if gas >= Gc or water >= Wc:
        return "CRITICAL"
    elif gas >= Gw or water >= Ww:
        return "WARNING"
    else:
        return "NORMAL"

def get_decision(risk):
    if risk == "CRITICAL":
        return "Deploy Machine Immediately"
    elif risk == "WARNING":
        return "Schedule Cleaning"
    else:
        return "Monitor Only"


@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()

    if not data:
        return jsonify({"status": "error", "message": "No data"}), 400

    name = data.get('name')
    email = data.get('email')
    password = data.get('password')

    hashed_password = generate_password_hash(password)

    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()

        cursor.execute('''
            INSERT INTO users (name, email, password)
            VALUES (?, ?, ?)
        ''', (name, email, hashed_password))

        conn.commit()
        conn.close()

        return jsonify({"status": "success"})

    except sqlite3.IntegrityError:
        return jsonify({"status": "fail", "message": "User already exists"})

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()

    if not data:
        return jsonify({"status": "error"}), 400

    email = data.get('email')
    password = data.get('password')

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM users WHERE email=?", (email,))
    user = cursor.fetchone()

    conn.close()

    if user and check_password_hash(user[3], password):
        return jsonify({"status": "success"})
    else:
        return jsonify({"status": "fail"})


@app.route('/api/data', methods=['POST'])
def receive_data():
    data = request.get_json()

    if not data:
        return jsonify({"error": "No data received"}), 400

    sewer_id = data.get('sewer_id', 'S1')
    gas = float(data.get('gas_level', 0))
    water = float(data.get('water_level', 0))

    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    risk = calculate_risk(gas, water)
    decision = get_decision(risk)

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute('''
        INSERT INTO sensor_data 
        (sewer_id, gas_level, water_level, timestamp, risk_level, decision)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', (sewer_id, gas, water, timestamp, risk, decision))

    conn.commit()
    conn.close()

    return jsonify({
        "status": "success",
        "gas": gas,
        "water": water,
        "risk": risk,
        "decision": decision
    })


@app.route('/api/data', methods=['GET'])
def get_data():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM sensor_data ORDER BY id DESC LIMIT 10")
    rows = cursor.fetchall()

    if len(rows) > 0:
        last_time_str = rows[0][4]
        last_time = datetime.strptime(last_time_str, "%Y-%m-%d %H:%M:%S")
        now = datetime.now()

        diff = (now - last_time).total_seconds()

        if diff > 10:
            conn.close()
            return jsonify([])

    conn.close()

    result = []
    for row in rows:
        result.append({
            "id": row[0],
            "sewer_id": row[1],
            "gas": row[2],
            "water": row[3],
            "time": row[4],
            "risk": row[5],
            "decision": row[6]
        })

    return jsonify(result)


@app.route('/api/trend', methods=['GET'])
def get_trend():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("SELECT gas_level, water_level, timestamp FROM sensor_data ORDER BY id DESC LIMIT 20")
    rows = cursor.fetchall()
    conn.close()

    result = []
    for row in rows:
        result.append({
            "gas": row[0],
            "water": row[1],
            "time": row[2]
        })

    return jsonify(result[::-1])


@app.route('/')
def home():
    return "Backend Running 🚀"

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
