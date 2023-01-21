import boto3
from decouple import config

def hello_s3():
    """
    Use the AWS SDK for Python (Boto3) to create an Amazon Simple Storage Service
    (Amazon S3) resource and list the buckets in your account.
    This example uses the default settings specified in your shared credentials
    and config files.
    """
    session = boto3.Session(
    aws_access_key_id=config('ACCESS_KEY'),
    aws_secret_access_key=config('SECRET_ACCESS_KEY'),
)
    s3_resource = session.resource('s3')
    print("Hello, Amazon S3! Let's list your buckets:")
    for bucket in s3_resource.buckets.all():
        print(bucket.name)

if __name__ == '__main__':
    hello_s3()
    # if correct it should output buckets or no bucket

