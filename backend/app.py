from flask import Flask
from flask import request, jsonify, session
import boto3

import sqlite3

app = Flask(__name__)

def get_db_connection():
    conn = sqlite3.connect('database.db')
    conn.row_factory = sqlite3.Row
    return conn

def writeUserDB(id: str, secret: str) -> None:
    conn = get_db_connection()
    conn.cursor()
    conn.execute("INSERT INTO users (access_key, secret_key, username) VALUES (?, ?, ?)",
            (f"{id}", f"{secret}", 'f{id}'))
    conn.commit()
    conn.close()


@app.route('/')
def hello():
    return '<h1>Hello, World!</h1>'

@app.route('/launch', methods=['POST'])
def login():
    data = request.get_json()
    session = boto3.Session(
    aws_access_key_id=data['access_key'],
    aws_secret_access_key=data['secret_key'])
    writeUserDB(data['access_key'], data['secret_key'])
    ec2_resource = session.client('ec2', region_name='us-west-2')
    response = ec2_resource.run_instances(
        MaxCount= 1,
        MinCount=1,
        InstanceType='t2.micro',
        ImageId='ami-095413544ce52437d',
        KeyName='awskey',
        Monitoring= {
            'Enabled':True,
        },
        InstanceMarketOptions={
        'MarketType': 'spot',
        'SpotOptions': {
            'MaxPrice': '.05',
            'SpotInstanceType': 'one-time',
        }
    },
    )
    spot_request_id = response['Instances'][0]['SpotInstanceRequestId']
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("INSERT INTO requests (id, current_status, user) VALUES (?, ?, ?)",
            (spot_request_id, 'open', session['username'])
    )
    conn.commit()
    conn.close()
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
        print(user['access_key'])
        usersData[user['username']] = user['id']
    conn.close()
    return jsonify( message= "Success",
                    statusCode= 200,
                    data= usersData), 200


def poll_for_terminations(ec2_resource):
    conn = get_db_connection()
    requests = conn.execute('SELECT * FROM requests').fetchall()
    sids = []
    for spot_request in requests:
        sid = spot_request['id']
        sids.append(sid)

    res = ec2_resource.describe_spot_instance_requests(
        DryRun=False,
        SpotInstanceRequestIds=sids,
    )
    print(res)
