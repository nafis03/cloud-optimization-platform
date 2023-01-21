from flask import Flask
from flask import request, jsonify
import boto3

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
    data = request.get_json()
    session = boto3.Session(
    aws_access_key_id=data['access_key'],
    aws_secret_access_key=data['secret_key'])
    ec2_resource = session.client('ec2', region_name='us-west-2')
    # response = ec2_resource.request_spot_instances(
    #     SpotPrice='0.10',
    #     DryRun=False,
    #     # ClientToken must be unique
    #     ClientToken='strin-0asssoog',
    #     InstanceCount=1,
    #     Type='one-time',
    #     LaunchSpecification={
    #         'ImageId': 'ami-095413544ce52437d',
    #         'KeyName': 'awskey',
    #         'SecurityGroups': ['default'],
    #         'InstanceType': 't2.micro',
    #         'EbsOptimized': True,
    #         'Monitoring': {
    #             'Enabled': True
    #         },
    #         'SecurityGroupIds': [
    #             'sg-0b549f5ce144da1be',
    #         ]
    #     }
    # )
    # print(response)
    res = ec2_resource.describe_spot_instance_requests(
        DryRun=False,
        SpotInstanceRequestIds=[
            'sir-zij6h97j',
        ],
    )
    print(res)
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



