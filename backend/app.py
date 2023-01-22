from flask import Flask
from flask import request, jsonify
import json
from polling import poll_for_status
import threading
import time
import boto3
import sqlite3
from enum import Enum

app = Flask(__name__)

session = ""

os  = {
    "AWSLinux" : "ami-0b5eea76982371e91",
    "MacOS" : "ami-0fe12b543f1354e5c",
    "Windows" : "ami-0fc4f8e1c20b02190",
    "Ubuntu" : "ami-00874d747dde814fa",
    "RedhatLinux" : "ami-0176fddd9698c4c3a",
}

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

def get_all_users():
    conn = get_db_connection()
    curr = conn.cursor()
    users = curr.execute("SELECT access_key, secret_key FROM users").fetchall()
    keys = []
    for user in users:
        keys.append((user['access_key'], user['secret_key']))
    return keys

def checker_thread():
    while True:
        keys = get_all_users()
        conn = get_db_connection()
        for key in keys:
            access_key = key[0]
            secret_key = key[1]
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
    # get the request data that has:
    #  username for credentials
    #  operating system
    #  size of instance
    data = request.get_json()

    # get credentials
    access_key, secret_key = get_access_and_secret(data['username'])
    session = boto3.Session(
    aws_access_key_id=access_key,
    aws_secret_access_key=secret_key)

    # initialize boto3 client
    ec2_resource = session.client('ec2', region_name='us-east-1')

    # start instance 
    response = ec2_resource.run_instances(
        MaxCount= 1,
        MinCount=1,
        InstanceType=data['instanceSize'],
        ImageId=os[data["operatingSystem"]],
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

    print(response)
    spot_request_id = response['Instances'][0]['SpotInstanceRequestId']
    conn = get_db_connection()
    curr = conn.cursor()

    query = "INSERT INTO requests (id, user) VALUES ('" + spot_request_id + "', " + "'tommyc'" + ")"
    curr.execute(query)

    # curr.execute("INSERT INTO spots (id, os, size, price) VALUES (?, ?, ?, ?)",
    #         (spot_request_id, data["operatingSystem"], data["instanceSize"], ))

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
            {
            'Type': 'TERM_MATCH',
            'Field': 'location',
            'Value': str(region)
            }
        ])
    
    prices = []

    for val in data['PriceList']:
        od = json.loads(val)['terms']['OnDemand']
        id1 = list(od)[0]
        id2 = list(od[id1]['priceDimensions'])[0]
        prices.append(od[id1]['priceDimensions'][id2]['pricePerUnit']['USD'])
    
    print(prices)
    return prices

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
