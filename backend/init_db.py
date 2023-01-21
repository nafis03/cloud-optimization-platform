import sqlite3

connection = sqlite3.connect('database.db')


with open('schema.sql') as f:
    connection.executescript(f.read())

cur = connection.cursor()

cur.execute("INSERT INTO users (access_key, secret_key, username) VALUES (?, ?, ?)",
            ('First Post', 'Content for the first post', 'asdas')
)

connection.commit()
connection.close()