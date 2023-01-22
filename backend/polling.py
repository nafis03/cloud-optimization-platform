
import boto3

def poll_for_status(access_key, secret_key, conn, user_id):
    session = boto3.Session(
    aws_access_key_id=access_key,
    aws_secret_access_key=secret_key)
    ec2_resource = session.client('ec2', region_name='us-east-1')
    curr = conn.cursor()
    query = "SELECT * FROM requests WHERE user= " + str(user_id)
    requests = curr.execute(query).fetchall()
    sids = []
    for spot_request in requests:
        sid = spot_request['id']
        sids.append(sid)

    res = ec2_resource.describe_spot_instance_requests(
        DryRun=False,
        SpotInstanceRequestIds=sids,
    )
    curr = conn.cursor()
    allReqs = res['SpotInstanceRequests']
    for sir in allReqs:
        status = sir['Status']
        if status['Code'] == 'fulfilled':
            curr.execute("SELECT 1 FROM instances WHERE id= '"+sir['InstanceId'] + "'")
            if not curr.fetchone():
                query = "INSERT INTO instances (id, sir, user) VALUES ('" + sir['InstanceId'] + "', '" + sir['SpotInstanceRequestId'] + "', " + "'tommyc'" + ")"
                curr.execute(query)
                spotPrice = sir["SpotPrice"]
                query = "UPDATE requests SET price= '" + spotPrice + "' WHERE id= '" + sir['SpotInstanceRequestId'] + "'"
            # update db with instance
            continue
        if status['Code'] == 'instance-terminated-by-user' or status['Code'] == 'spot-instance-terminated-by-user':
            query = "DELETE FROM instances WHERE id= '" + sir['InstanceId'] + "'"
            curr.execute(query)
            query = "DELETE FROM requests WHERE id= '" + sir['SpotInstanceRequestId'] + "'"
            curr.execute(query)
            # maybe do some computation
            continue
        if status['Code'] == 'instance-stopped-no-capacity':
            query = "DELETE FROM instances WHERE id= '" + sir['InstanceId'] + "'"
            curr.execute(query)
            query = "SELECT * FROM requests WHERE id= '" + sir['SpotInstanceRequestId'] + "'"
            req = curr.execute(query).fetchone()
            instanceSize = req['size']
            imageName = req['imageName']
            query = "DELETE FROM requests WHERE id= '" + sir['SpotInstanceRequestId'] + "'"
            curr.execute(query)
            response = ec2_resource.run_instances(
                MaxCount= 1,
                MinCount=1,
                InstanceType=instanceSize,
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

            query = "INSERT INTO requests (id, user, imageName, size) VALUES ('" + spot_request_id + "', " + "'tommyc', '" + imageName + "', '" + instanceSize + "')"
            curr.execute(query)
            continue
        if status['Code'] == 'marked-for-termination':
            # relaunch instance
            continue
        if status['Code'] == 'instance-terminated-by-experiment' or status['Code'] == 'marked-for-stop-by-experiment':
            # relaunch instance
            query = "DELETE FROM instances WHERE id= '" + sir['InstanceId'] + "'"
            curr.execute(query)
            query = "SELECT * FROM requests WHERE id= '" + sir['SpotInstanceRequestId'] + "'"
            req = curr.execute(query).fetchone()
            instanceSize = req['size']
            imageName = req['imageName']
            query = "DELETE FROM requests WHERE id= '" + sir['SpotInstanceRequestId'] + "'"
            curr.execute(query)
            response = ec2_resource.run_instances(
                MaxCount= 1,
                MinCount=1,
                InstanceType=instanceSize,
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

            query = "INSERT INTO requests (id, user, imageName, size) VALUES ('" + spot_request_id + "', " + "'tommyc', '" + imageName + "', '" + instanceSize + "')"
            curr.execute(query)
            continue

    conn.commit()
    return