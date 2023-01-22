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
    "Game": "ami-02adefdded55e3e68"
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

def get_user_id(username):
    conn = get_db_connection()
    curr = conn.cursor()
    query = "SELECT id FROM users WHERE username= '" + username + "'"
    users = curr.execute(query).fetchone()
    return users['id']

def get_all_users():
    conn = get_db_connection()
    curr = conn.cursor()
    users = curr.execute("SELECT id, access_key, secret_key FROM users").fetchall()
    keys = []
    for user in users:
        keys.append((user['access_key'], user['secret_key'], user['id']))
    return keys

def checker_thread():
    while True:
        keys = get_all_users()
        conn = get_db_connection()
        for key in keys:
            access_key = key[0]
            secret_key = key[1]
            user_id = key[2]
            poll_for_status(access_key, secret_key, conn, user_id)
        conn.close()
        time.sleep(12)

def writeUserDB(username, access_key: str, secret_key: str) -> None:
    conn = get_db_connection()
    curr = conn.cursor()
    curr.execute("INSERT INTO users (access_key, secret_key, username) VALUES (?, ?, ?)",
            (access_key, secret_key, username))
    conn.commit()
    conn.close()

# Get current AWS price for an on-demand instance
def get_price(region, instance, os, access_key, secret_key):
    session = boto3.Session(
    aws_access_key_id=access_key,
    aws_secret_access_key=secret_key)
    client = session.client('pricing', region_name='us-east-1')
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
    pricesVal = []
    for price in prices:
        val = float(price)
        pricesVal.append(val)
    return max(pricesVal)

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
    if data["operatingSystem"] == "Game":
        UserDataScript = '''
        #!/bin/bash
        cd TIC-TAC-TOE-GAME/
        npm start
        '''
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
            UserData=UserDataScript,
        )
    else:
        response = ec2_resource.run_instances(
            MaxCount= 1,
            MinCount=1,
            InstanceType=data['instanceSize'],
            ImageId=os[data["workload"]],
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
    # spotPrice = response["SpotInstanceRequests"][0]["SpotPrice"]
    # time = response["SpotInstanceRequests"][0]["Createtime"]
    # frontEndResponse = {
    #     "imageName": data["imageName"],
    #     "imageID": spot_request_id,
    #     'timestamp': time
    # }
    frontEndResponse = {
        "sir": spot_request_id
    }
    user_id = get_user_id(data['username'])
    conn = get_db_connection()
    curr = conn.cursor()

    query = "INSERT INTO requests (id, user, imageName, size) VALUES ('" + spot_request_id + "', " + str(user_id) + ", '" +  data["imageName"] + "', '" + data['instanceSize'] + "')"
    curr.execute(query)

    conn.commit()
    conn.close()

    return jsonify(isError= False,
                    message= "Success",
                    statusCode= 200,
                    data=frontEndResponse), 200

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
        query2 = "SELECT * FROM requests WHERE id= '" + req['sir'] + "'"
        req2 = conn.execute(query2).fetchone()
        retObject = {
            "id": req['id'],
            "imageName": req2['imageName'],
            "instanceSize": req2['size'],
            "timestamp": req2['created']
        }
        reqsData.append(retObject)
        reqsData
        
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
    ec2_resource = session.client('ec2', region_name='us-east-1')
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
    ec2_resource = session.client('ec2', region_name='us-east-1')
    response = ec2_resource.terminate_instances(
    InstanceIds=[
        data['instanceID'],
    ],
        DryRun=False
    )
    conn = get_db_connection()
    curr = conn.cursor()
    query = "SELECT sir FROM instances WHERE id= '" + data['instanceID'] + "'"
    resp = curr.execute(query).fetchone()
    sir = resp['sir']
    query = "DELETE FROM instances WHERE id= '" + data['instanceID'] + "'"
    curr.execute(query)
    query = "DELETE FROM requests WHERE id= '" + sir + "'"
    curr.execute(query)
    conn.commit()
    conn.close()
    resp2 = ec2_resource.cancel_spot_instance_requests(
        DryRun=False,
        SpotInstanceRequestIds=[sir]
    )
    return jsonify( message= "success",
                    statusCode= 200,
                    data= response), 200

@app.route('/getEC2Price', methods=['POST'])
def getEC2Price():
    data = request.get_json()
    access_key, secret_key = get_access_and_secret(data['username'])
    # Get current price for a given instance, region and os
    price = get_price('US East (N. Virginia)', data["instanceSize"], data["operatingSystem"], access_key, secret_key)
    return jsonify( message= "Success",
                    statusCode= 200,
                    data= price), 200

@app.route('/dashboard', methods=['POST'])
def dashboard():
    # get credentials
    data = request.get_json()
    user = data["username"]
    user_id = get_user_id(user)
    access_key, secret_key = get_access_and_secret(user)

    # get the instanceSize
    conn = get_db_connection()
    curr = conn.cursor()
    query = "SELECT size, price FROM requests WHERE user= " + str(user_id)
    sirs = curr.execute(query).fetchall()
    totalSavedPerHour = 0.0
    onDemandPerHour = 0.0
    spotPerHour = 0.0
    for sir in sirs:
        fullPrice = get_price('US East (N. Virginia)', sir['size'], "Linux", access_key, secret_key)
        totalSavedPerHour += (fullPrice - float(sir['price']))
        onDemandPerHour += fullPrice
        spotPerHour += float(sir['price'])

    retData = {"totalSavedPerHour":totalSavedPerHour,
                "onDemandPerHour": onDemandPerHour,
                "spotPerHour":spotPerHour}
    return jsonify( message= "Success",
                    statusCode= 200,
                    data= retData), 200

                    
x = threading.Thread(target=checker_thread)
x.start()

app.run(threaded=False,debug=False, port=3002)
