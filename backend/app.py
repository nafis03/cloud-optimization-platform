from flask import Flask
from flask import request, jsonify

import sqlite3

app = Flask(__name__)

def get_db_connection():
    conn = sqlite3.connect('database.db')
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/')
def hello():
    return '<h1>Hello, World!</h1>'

@app.route('/login', methods=['POST'])
def login():
    data = request.form
    print(data.get('access_key'))
    print(data.get('secret_key'))
    return jsonify(isError= False,
                    message= "Success",
                    statusCode= 200,
                    data= data), 200

@app.route('/db')
def db():
    conn = get_db_connection()
    users = conn.execute('SELECT * FROM users').fetchall()
    usersData = {}
    for user in users:
        usersData[user['username']] = user['id']
    conn.close()
    return jsonify( message= "Success",
                    statusCode= 200,
                    data= usersData), 200




