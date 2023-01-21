from flask import Flask
import sqlite3

app = Flask(__name__)

def get_db_connection():
    conn = sqlite3.connect('database.db')
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/')
def hello():
    return '<h1>Hello, World!</h1>'

<<<<<<< HEAD
@app.route('/db')
def db():
    conn = get_db_connection()
    posts = conn.execute('SELECT * FROM users').fetchall()
    conn.close()
    print(posts[0]['id'])
    return '<h1>Hello, World!</h1>'

    
=======
>>>>>>> 643656025f33113e9b970a5fdcbbb47c6d8e468a