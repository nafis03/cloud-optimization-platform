from flask import Flask
from flask import request, jsonify

import boto3

import sqlite3

app = Flask(__name__)

def get_db_connection():
    conn = sqlite3.connect('database.db')
    conn.row_factory = sqlite3.Row
    return conn

def writeUserDB(username, access_key: str, secret_key: str) -> None:
    conn = get_db_connection()
    curr = conn.cursor()
    curr.execute("INSERT INTO users (access_key, secret_key, username) VALUES (?, ?, ?)",
            (access_key, secret_key, username))
    conn.commit()
    conn.close()

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    writeUserDB(data['username'], data['access_key'], data['secret_key'])
    return jsonify(isError= False,
                    message= "Success",
                    statusCode= 200), 200

def get_access_and_secret(username):
    conn = get_db_connection()
    curr = conn.cursor()
    user = curr.execute("SELECT * FROM users WHERE username=? LIMIT 1",
            (username,)).fetchone()
    
    conn.close()
    return user['access_key'], user['secret_key']

@app.route('/launch', methods=['POST'])
def launch():
    access_key, secret_key = get_access_and_secret('tommyc')
    session = boto3.Session(
    aws_access_key_id=access_key,
    aws_secret_access_key=secret_key)
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
            (spot_request_id, 'open', 'tommyc')
    )
    conn.commit()
    conn.close()
    return jsonify(isError= False,
                    message= "Success",
                    statusCode= 200), 200

@app.route('/db/users')
def dbUsers():
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

@app.route('/db/requests')
def dbReqs():
    conn = get_db_connection()
    reqs = conn.execute('SELECT * FROM requests').fetchall()
    reqsData = []
    for req in reqs:
        reqsData.append(req['id'])
    conn.close()
    return jsonify( message= "Success",
                    statusCode= 200,
                    data= reqsData), 200


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
