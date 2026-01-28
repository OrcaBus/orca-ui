import * as path from 'path';
import {
  OriginAccessIdentity,
  Distribution,
  ViewerProtocolPolicy,
  PriceClass,
  SecurityPolicyProtocol,
  SSLMethod,
} from 'aws-cdk-lib/aws-cloudfront';
import { S3BucketOrigin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { Duration, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager';
import { ARecord, HostedZone, RecordTarget } from 'aws-cdk-lib/aws-route53';
import { CloudFrontTarget } from 'aws-cdk-lib/aws-route53-targets';
import { BlockPublicAccess, Bucket, IBucket } from 'aws-cdk-lib/aws-s3';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';
import { Architecture, Code, Runtime } from 'aws-cdk-lib/aws-lambda';
// import { BuildEnvironmentVariableType } from 'aws-cdk-lib/aws-codebuild';
import { AccountPrincipal, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Function } from 'aws-cdk-lib/aws-lambda';
import { TOOLCHAIN_ACCOUNT_ID } from '../config';
import { Key } from 'aws-cdk-lib/aws-kms';
export type ApplicationStackProps = {
  cloudFrontBucketName: string;
  configLambdaName: string;
  aliasDomainName: string[];
  reactBuildEnvVariables: Record<string, string>;
};

export class ApplicationStack extends Stack {
  constructor(scope: Construct, id: string, props: ApplicationStackProps & StackProps) {
    super(scope, id, props);

    const clientBucket = new Bucket(this, 'OrcaUIAssetCloudFrontBucket', {
      bucketName: props.cloudFrontBucketName,
      autoDeleteObjects: true,
      enforceSSL: true,
      removalPolicy: RemovalPolicy.DESTROY,
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: 'index.html',
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
    });

    const distribution = this.setupS3CloudFrontIntegration(clientBucket, props.aliasDomainName);

    /*
      Trigger CodeBuild pipeline to build and deploy the react app
      This lambda function has 3 stages:
      1. read all env variables from os environment variables
      2. write into env.js, upload to the S3 bucket
      3. invalidate the CloudFront cache
    */

    const logGroup = new LogGroup(this, 'EnvConfigLambdaLogGroup', {
      retention: RetentionDays.ONE_WEEK,
    });

    const configLambda = new Function(this, 'EnvConfigLambda', {
      functionName: props.configLambdaName,
      code: Code.fromAsset(path.join(__dirname, '..', 'lambda')),
      timeout: Duration.minutes(10),
      handler: 'env_config_and_cdn_refresh.handler',
      logGroup: logGroup,
      runtime: Runtime.PYTHON_3_12,
      architecture: Architecture.ARM_64,
      memorySize: 1024,
      environment: {
        VITE_REGION: 'ap-southeast-2',
        BUCKET_NAME: clientBucket.bucketName,
        CLOUDFRONT_DISTRIBUTION_ID: distribution.distributionId,
        ...props.reactBuildEnvVariables,
        VITE_COG_APP_CLIENT_ID: '/orcaui/cog_app_client_id_stage',
        VITE_OAUTH_REDIRECT_IN: '/orcaui/oauth_redirect_in_stage',
        VITE_OAUTH_REDIRECT_OUT: '/orcaui/oauth_redirect_out_stage',
        VITE_COG_USER_POOL_ID: '/data_portal/client/cog_user_pool_id',
        VITE_OAUTH_DOMAIN: '/data_portal/client/oauth_domain',
        VITE_UNSPLASH_CLIENT_ID: '/data_portal/unsplash/client_id',
      },
    });

    clientBucket.grantReadWrite(configLambda);
    distribution.grantCreateInvalidation(configLambda);
    // Grant SSM read permissions to the Lambda function
    // Grant KMS decrypt permissions for secure string parameters
    const kmsKey = Key.fromLookup(this, 'SSMKey', { aliasName: 'alias/aws/ssm' });
    kmsKey.grantDecrypt(configLambda);
    configLambda.addToRolePolicy(
      new PolicyStatement({
        actions: ['ssm:Get*', 'kms:Decrypt'],
        resources: [
          `arn:aws:ssm:${this.region}:${this.account}:parameter/orcaui/*`,
          `arn:aws:ssm:${this.region}:${this.account}:parameter/data_portal/*`,
          kmsKey.keyArn,
        ],
      })
    );

    /*
      Grant the toolchain account access to the S3 bucket and lambda function
      so that it can invoke the lambda function to trigger the CodeBuild pipeline
    */
    clientBucket.grantDelete(new AccountPrincipal(TOOLCHAIN_ACCOUNT_ID));
    clientBucket.grantReadWrite(new AccountPrincipal(TOOLCHAIN_ACCOUNT_ID));
    configLambda.grantInvoke(new AccountPrincipal(TOOLCHAIN_ACCOUNT_ID));
  }

  private setupS3CloudFrontIntegration(s3Bucket: IBucket, aliasDomainName: string[]): Distribution {
    const hostedZoneName = StringParameter.valueForStringParameter(this, '/hosted_zone/umccr/name');
    const hostedZoneId = StringParameter.valueForStringParameter(this, '/hosted_zone/umccr/id');

    const hostedZone = HostedZone.fromHostedZoneAttributes(this, 'HostedZone', {
      hostedZoneId: hostedZoneId,
      zoneName: hostedZoneName,
    });

    const certUse1Arn = StringParameter.valueForStringParameter(this, '/orcaui/certificate_arn');
    const certUse1 = Certificate.fromCertificateArn(this, 'SSLCertificateUSE1', certUse1Arn);

    const cloudFrontOAI = new OriginAccessIdentity(this, 'CloudFrontOAI', {
      comment: 'orca-ui OAI',
    });

    const cloudFrontDistribution = new Distribution(this, 'CloudFrontDistribution', {
      defaultBehavior: {
        origin: S3BucketOrigin.withOriginAccessIdentity(s3Bucket, {
          originAccessIdentity: cloudFrontOAI,
        }),
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      errorResponses: [
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: Duration.minutes(1),
        },
      ],
      defaultRootObject: 'index.html',
      priceClass: PriceClass.PRICE_CLASS_ALL,
      enableIpv6: false,
      certificate: certUse1,
      domainNames: aliasDomainName,
      minimumProtocolVersion: SecurityPolicyProtocol.TLS_V1_2_2021,
      sslSupportMethod: SSLMethod.SNI,
    });

    // Support dual access via both 'portal' and 'orcaui' subdomains.
    // Both A records alias to the same CloudFront distribution at no additional cost.
    // This enables a gradual domain migration from 'orcaui' to 'portal' while maintaining backward compatibility.

    new ARecord(this, 'PortalDomainAlias', {
      target: RecordTarget.fromAlias(new CloudFrontTarget(cloudFrontDistribution)),
      zone: hostedZone,
      recordName: 'portal',
    });

    new ARecord(this, 'CustomDomainAlias', {
      target: RecordTarget.fromAlias(new CloudFrontTarget(cloudFrontDistribution)),
      zone: hostedZone,
      recordName: 'orcaui',
    });

    return cloudFrontDistribution;
  }
}
