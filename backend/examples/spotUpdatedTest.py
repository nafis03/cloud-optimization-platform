import boto3

session = boto3.Session(
    aws_access_key_id="AKIASO5FL42OUJKE3GNF",
    aws_secret_access_key="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",
)
ec2_resource = session.client('ec2')
response = ec2_resource.request_spot_instances(
    DryRun=False,
    SpotPrice='0.10',
    # ClientToken must be unique
    ClientToken='strdfsasdin-fgdog',
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
print(response)