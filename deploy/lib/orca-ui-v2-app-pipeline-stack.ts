import { Stack, StackProps } from 'aws-cdk-lib';
import { BuildSpec, LinuxArmBuildImage, PipelineProject } from 'aws-cdk-lib/aws-codebuild';
import {
  Artifact,
  CfnPipeline,
  Pipeline,
  PipelineType,
  StageProps,
} from 'aws-cdk-lib/aws-codepipeline';
import {
  CodeBuildAction,
  CodeStarConnectionsSourceAction,
  ManualApprovalAction,
} from 'aws-cdk-lib/aws-codepipeline-actions';
import { Effect, PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';
import {
  accountIdAlias,
  AppStage,
  configLambdaNameConfig,
  getInfrastructureStackConfig,
  REGION,
  v2CloudFrontBucketNameConfig,
} from '../config';

export class OrcaUIV2AppPipelineStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    const ghBranchName = 'main';
    const buildImage = LinuxArmBuildImage.AMAZON_LINUX_2023_STANDARD_3_0;
    const validateEnvConfigLambdaResponse =
      "python3 -c \"import json, sys; meta=json.load(open('invoke-result.json')); payload=json.load(open('response.json')); print(payload.get('body', payload)); sys.exit(1 if meta.get('FunctionError') or payload.get('statusCode') != 200 else 0)\"";
    const codeStarArn = StringParameter.valueForStringParameter(this, 'codestar_github_arn');
    const sourceOutput = new Artifact();
    const buildOutput = new Artifact();

    const buildProject = new PipelineProject(this, 'OrcaUIV2BuildProject', {
      projectName: 'OrcaUIV2BuildProject',
      description: 'Build Orca UI v2 app',
      buildSpec: BuildSpec.fromObject({
        version: 0.2,
        phases: {
          install: {
            'runtime-versions': {
              nodejs: 22,
            },
            commands: [
              'node -v',
              'corepack enable',
              'pnpm --version',
              'pnpm install --frozen-lockfile',
            ],
          },
          build: {
            commands: ['set -eu', 'make generate-openapi-types', 'pnpm build'],
          },
        },
        artifacts: {
          files: ['**/**'],
          'base-directory': 'build/',
        },
      }),
      environment: { buildImage },
    });

    const deployProject = (env: AppStage) => {
      const destinationBucketName = v2CloudFrontBucketNameConfig[env];
      if (!destinationBucketName) {
        throw new Error(`V2 CloudFront bucket is not configured for ${env}`);
      }

      const deployProjectRole = new Role(this, `OrcaUIV2DeployProjectRole${env}`, {
        assumedBy: new ServicePrincipal('codebuild.amazonaws.com'),
      });

      deployProjectRole.addToPolicy(
        new PolicyStatement({
          effect: Effect.ALLOW,
          actions: ['s3:Get*', 's3:List*', 's3:PutObject', 's3:DeleteObject'],
          resources: [
            `arn:aws:s3:::${destinationBucketName}`,
            `arn:aws:s3:::${destinationBucketName}/*`,
          ],
        })
      );

      deployProjectRole.addToPolicy(
        new PolicyStatement({
          effect: Effect.ALLOW,
          actions: ['lambda:InvokeFunction'],
          resources: [
            `arn:aws:lambda:${REGION}:${accountIdAlias[env]}:function:${configLambdaNameConfig[env]}`,
          ],
        })
      );

      return new PipelineProject(this, `OrcaUIV2DeployProject${env}`, {
        projectName: `OrcaUIV2DeployProject${env}`,
        description: 'Deploy Orca UI v2 app',
        buildSpec: BuildSpec.fromObject({
          version: 0.2,
          phases: {
            build: {
              commands: [
                'aws s3 sync . s3://${DESTINATION_BUCKET_NAME}/v2/ --delete',
                'aws lambda invoke --function-name arn:aws:lambda:${REGION}:${DESTINATION_ACCOUNT_ID}:function:${CONFIG_LAMBDA_NAME} response.json > invoke-result.json',
                validateEnvConfigLambdaResponse,
              ],
            },
          },
        }),
        environment: { buildImage },
        environmentVariables: {
          DESTINATION_BUCKET_NAME: {
            value: destinationBucketName,
          },
          CONFIG_LAMBDA_NAME: {
            value: configLambdaNameConfig[env],
          },
          REGION: {
            value: REGION,
          },
          DESTINATION_ACCOUNT_ID: {
            value: accountIdAlias[env],
          },
        },
        role: deployProjectRole,
      });
    };

    const gammaConfig = getInfrastructureStackConfig(AppStage.GAMMA);
    const openApiTsCheck = v2CloudFrontBucketNameConfig[AppStage.GAMMA]
      ? new PipelineProject(this, 'OrcaUIV2OpenApiTSCheck', {
          projectName: 'OrcaUIV2-OpenApiTSCheck',
          description: 'Test Orca UI v2 artifact with OpenAPI schema from relevant STG stage.',
          buildSpec: BuildSpec.fromObject({
            version: 0.2,
            env: { variables: gammaConfig.reactBuildEnvVariables },
            phases: {
              install: {
                'runtime-versions': {
                  nodejs: 22,
                },
                commands: [
                  'node -v',
                  'corepack enable',
                  'pnpm --version',
                  'pnpm install --frozen-lockfile',
                ],
              },
              build: {
                commands: ['set -eu', 'make generate-openapi-types', 'pnpm type-check'],
              },
            },
          }),
          environment: { buildImage },
        })
      : undefined;

    const codeStarSourceName = 'orcauiV2AppSrc';
    const stages: StageProps[] = [
      {
        stageName: 'Source',
        actions: [
          new CodeStarConnectionsSourceAction({
            actionName: codeStarSourceName,
            owner: 'OrcaBus',
            repo: 'orca-ui-v2',
            branch: ghBranchName,
            connectionArn: codeStarArn,
            output: sourceOutput,
            triggerOnPush: true,
          }),
        ],
      },
      {
        stageName: 'Build',
        actions: [
          new CodeBuildAction({
            actionName: 'BuildAndDeploy',
            project: buildProject,
            input: sourceOutput,
            outputs: [buildOutput],
          }),
        ],
      },
    ];

    if (v2CloudFrontBucketNameConfig[AppStage.BETA]) {
      stages.push({
        stageName: 'DeployToBeta',
        actions: [
          new CodeBuildAction({
            actionName: 'DeployToBeta',
            project: deployProject(AppStage.BETA),
            input: buildOutput,
          }),
        ],
      });
    }

    if (v2CloudFrontBucketNameConfig[AppStage.GAMMA]) {
      stages.push({
        stageName: 'DeployToGamma',
        actions: [
          new CodeBuildAction({
            actionName: 'TSCheckWithStgOpenAPI',
            project: openApiTsCheck!,
            input: sourceOutput,
            runOrder: 1,
          }),
          new CodeBuildAction({
            actionName: 'DeployToGamma',
            project: deployProject(AppStage.GAMMA),
            input: buildOutput,
            runOrder: 2,
          }),
        ],
      });
    }

    if (v2CloudFrontBucketNameConfig[AppStage.PROD]) {
      stages.push({
        stageName: 'DeployToProdApproval',
        actions: [
          new ManualApprovalAction({
            actionName: 'ApproveDeployToProd',
          }),
        ],
      });

      stages.push({
        stageName: 'DeployToProd',
        actions: [
          new CodeBuildAction({
            actionName: 'DeployToProd',
            project: deployProject(AppStage.PROD),
            input: buildOutput,
          }),
        ],
      });
    }

    const appCiCdPipeline = new Pipeline(this, 'OrcaUIV2AppCICDPipeline', {
      pipelineType: PipelineType.V2,
      pipelineName: 'OrcaUIV2AppCICDPipeline',
      crossAccountKeys: false,
      stages,
    });

    const appCiCdCfnPipeline = appCiCdPipeline.node.defaultChild as CfnPipeline;
    appCiCdCfnPipeline.addPropertyOverride('Triggers', [
      {
        GitConfiguration: {
          Push: [
            {
              Branches: {
                Includes: [ghBranchName],
              },
              FilePaths: {
                Excludes: ['deploy/**'],
              },
            },
          ],
          SourceActionName: codeStarSourceName,
        },
        ProviderType: 'CodeStarSourceConnection',
      },
    ]);
  }
}
