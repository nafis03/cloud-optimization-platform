from flask import Flask
from flask import request, jsonify
import json
from polling import poll_for_status
import threading
import time
import boto3

import sqlite3

def get_access_and_secret(username):
    conn = get_db_connection()
    curr = conn.cursor()
    user = curr.execute("SELECT * FROM users WHERE username=? LIMIT 1",
            (username,)).fetchone()
    
    conn.close()
    return user['access_key'], user['secret_key']

def get_db_connection():
    conn = sqlite3.connect('database.db')
    conn.row_factory = sqlite3.Row
    return conn

def checker_thread():
    print("Get thready/")
    time.sleep(10)
    access_key, secret_key = get_access_and_secret('tommyc')
    while True:
        conn = get_db_connection()
        print("Polling!")
        poll_for_status(access_key, secret_key, conn)
        conn.close()
        time.sleep(30)

def writeUserDB(username, access_key: str, secret_key: str) -> None:
    conn = get_db_connection()
    curr = conn.cursor()
    curr.execute("INSERT INTO users (access_key, secret_key, username) VALUES (?, ?, ?)",
            (access_key, secret_key, username))
    conn.commit()
    conn.close()

app = Flask(__name__)

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    writeUserDB(data['username'], data['access_key'], data['secret_key'])
    return jsonify(isError= False,
                    message= "Success",
                    statusCode= 200), 200

@app.route('/launch', methods=['POST'])
def launch():
    data = request.get_json()
    access_key, secret_key = get_access_and_secret(data['username'])
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
            'SpotInstanceType': 'persistent',
            'InstanceInterruptionBehavior': 'stop'
        }
    },
    )
    spot_request_id = response['Instances'][0]['SpotInstanceRequestId']
    conn = get_db_connection()
    curr = conn.cursor()

    query = "INSERT INTO requests (id, user) VALUES ('" + spot_request_id + "', " + "'tommyc'" + ")"
    curr.execute(query)

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

@app.route('/db/instances')
def dbInstances():
    conn = get_db_connection()
    reqs = conn.execute('SELECT * FROM instances').fetchall()
    reqsData = []
    for req in reqs:
        reqsData.append(req['id'])
    conn.close()
    return jsonify( message= "Success",
                    statusCode= 200,
                    data= reqsData), 200

@app.route('/stopInstance')
def stopInstance():
    data = request.get_json()
    access_key, secret_key = get_access_and_secret(data['username'])
    session = boto3.Session(
    aws_access_key_id=access_key,
    aws_secret_access_key=secret_key)
    ec2_resource = session.client('ec2', region_name='us-west-2')
    response = ec2_resource.stop_instances(
        InstanceIds=[data['instanceID'],],
        Hibernate=False,
        DryRun=False,
        Force=True
        )
    return jsonify( message= "Success",
                    statusCode= 200,
                    data= response), 200


@app.route('/terminateInstance', methods=['POST'])
def terminateInstance():
    data = request.get_json()
    access_key, secret_key = get_access_and_secret(data['username'])
    session = boto3.Session(
    aws_access_key_id=access_key,
    aws_secret_access_key=secret_key)
    ec2_resource = session.client('ec2', region_name='us-west-2')
    response = ec2_resource.terminate_instances(
    InstanceIds=[
        data['instanceID'],
    ],
        DryRun=False
    )
    return jsonify( message= "Success",
                    statusCode= 200,
                    data= response), 200

# Get current AWS price for an on-demand instance
def get_price(region, instance, os):
    client = boto3.client('pricing', region_name='us-east-1')
    data = client.get_products(
        ServiceCode='AmazonEC2', 
        Filters=[
            {
            'Type': 'TERM_MATCH',
            'Field': 'instanceType',
            'Value': str(instance)
            },
            {
            'Type': 'TERM_MATCH',
            'Field': 'operatingSystem',
            'Value': str(os)
            },
        ])
    od = json.loads(data['PriceList'][0])['terms']['OnDemand']
    id1 = list(od)[0]
    id2 = list(od[id1]['priceDimensions'])[0]
    return od[id1]['priceDimensions'][id2]['pricePerUnit']['USD']

@app.route('/getEC2Price', methods=['POST'])
def getEC2Price():
    # Get current price for a given instance, region and os
    price = get_price('US East (N. Virginia)', 't2.micro', 'Linux')
    print(price)
    return jsonify( message= "Success",
                    statusCode= 200,
                    data= price), 200
                    
x = threading.Thread(target=checker_thread)
x.start()

app.run(threaded=False,debug=False, port=3002)
