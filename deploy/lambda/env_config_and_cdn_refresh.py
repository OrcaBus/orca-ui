
import os
import boto3
import json

ssm = boto3.client('ssm')
s3 = boto3.client('s3')
cloudfront = boto3.client('cloudfront')


def get_ssm_parameter(name, with_decryption=False):
    """Fetch a SSM parameter"""
    try:
        response = ssm.get_parameter(Name=name, WithDecryption=with_decryption)
        return response['Parameter']['Value']
    except Exception as e:
        print(f"Error fetching SSM parameter {name}: {e}")
        return None


def update_api_versions(event):
    """Update API versions from event with validation and logging"""
    if not event or not isinstance(event, dict):
        print("No update event data received, skipping API version updates")
        return

    api_version_mappings = {
        'metadata_api_version': 'VITE_METADATA_API_VERSION',
        'workflow_api_version': 'VITE_WORKFLOW_API_VERSION',
        'sequence_run_api_version': 'VITE_SEQUENCE_RUN_API_VERSION',
        'file_api_version': 'VITE_FILE_API_VERSION',
        'htsget_api_version': 'VITE_HTSGET_API_VERSION',
    }

    # Check if any version keys exist in the event
    if not any(key in event for key in api_version_mappings):
        print("No API version updates found in event")
        return

    # update the environment variables
    for event_key, env_key in api_version_mappings.items():
        version = event.get(event_key)
        if version and isinstance(version, str):
            os.environ[env_key] = version
            print(f"Updated {env_key} to {version}")


def handler(event, context):
    """Handler for the lambda function"""

    # read the event to update the api version
    update_api_versions(event)

    bucket_name = os.environ['BUCKET_NAME']
    cloudfront_distribution_id = os.environ['CLOUDFRONT_DISTRIBUTION_ID']

    # List of SSM parameters to fetch
    env_vars = {
        'VITE_COG_APP_CLIENT_ID': get_ssm_parameter('/orcaui/cog_app_client_id_stage'),
        'VITE_OAUTH_REDIRECT_IN': get_ssm_parameter('/orcaui/oauth_redirect_in_stage'),
        'VITE_OAUTH_REDIRECT_OUT': get_ssm_parameter('/orcaui/oauth_redirect_out_stage'),
        'VITE_COG_USER_POOL_ID': get_ssm_parameter('/data_portal/client/cog_user_pool_id'),
        'VITE_OAUTH_DOMAIN': get_ssm_parameter('/data_portal/client/oauth_domain'),
        'VITE_UNSPLASH_CLIENT_ID': get_ssm_parameter('/data_portal/unsplash/client_id'),

        'VITE_REGION': os.environ['VITE_REGION'],
        'VITE_METADATA_URL': os.environ['VITE_METADATA_URL'],
        'VITE_WORKFLOW_URL': os.environ['VITE_WORKFLOW_URL'],
        'VITE_SEQUENCE_RUN_URL': os.environ['VITE_SEQUENCE_RUN_URL'],
        'VITE_FILE_URL': os.environ['VITE_FILE_URL'],
        'VITE_SSCHECK_URL': os.environ['VITE_SSCHECK_URL'],
        'VITE_HTSGET_URL': os.environ.get('VITE_HTSGET_URL', None),
        'VITE_CASE_URL': os.environ['VITE_CASE_URL'],

        # API Version
        'VITE_METADATA_API_VERSION': os.environ.get('VITE_METADATA_API_VERSION', None),
        'VITE_WORKFLOW_API_VERSION': os.environ.get('VITE_WORKFLOW_API_VERSION', None),
        'VITE_SEQUENCE_RUN_API_VERSION': os.environ.get('VITE_SEQUENCE_RUN_API_VERSION', None),
        'VITE_FILE_API_VERSION': os.environ.get('VITE_FILE_API_VERSION', None),
        'VITE_HTSGET_API_VERSION': os.environ.get('VITE_HTSGET_API_VERSION', None),
        'VITE_CASE_API_VERSION': os.environ.get('VITE_CASE_API_VERSION', None),
    }
    # Remove null values
    env_vars = {k: v for k, v in env_vars.items() if v is not None}

    env_js_content = f"window.config = {json.dumps(env_vars, indent=2)}"

    try:
        s3.put_object(Bucket=bucket_name, Key='env.js',
                      Body=env_js_content, ContentType='text/javascript')

        # invalidate cloudfront distribution for all files (clear cache)
        cloudfront.create_invalidation(
            DistributionId=cloudfront_distribution_id,
            InvalidationBatch={
                'Paths': {
                    'Quantity': 1,
                    'Items': ['/*']
                },
                'CallerReference': str(context.aws_request_id)
            }
        )

        return {
            'statusCode': 200,
            'body': f" env.js uploaded to {bucket_name}, and CloudFront cache invalidated for {cloudfront_distribution_id}"
        }
    except Exception as e:
        # Log the error and return a failure response
        print("Error:")
        print(e)
        return {
            'statusCode': 500,
            'body': f"Failed to upload env.js to {bucket_name}. {e}"
        }
