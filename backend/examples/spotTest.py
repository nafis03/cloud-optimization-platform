import boto3

session = boto3.Session(
    aws_access_key_id="id",
    aws_secret_access_key="accessKey",
)
ec2_resource = session.client('ec2')
response = ec2_resource.request_spot_instances(
    DryRun=False,
    SpotPrice='0.10',
    # ClientToken must be unique
    ClientToken='strin-0oog',
    InstanceCount=1,
    Type='one-time',
    LaunchSpecification={
        'ImageId': 'ami-095413544ce52437d',
        'KeyName': 'awskey',
        'SecurityGroups': ['default'],
        'InstanceType': 't2.micro',
        
        'EbsOptimized': True,
        'Monitoring': {
            'Enabled': True
        },
        'SecurityGroupIds': [
            'sg-05ff06817b0ce7406',
        ]
    }
)