import { Environment, Stack, StackProps, Stage } from 'aws-cdk-lib';
import { ComputeType, LinuxArmBuildImage } from 'aws-cdk-lib/aws-codebuild';
import { CfnPipeline, Pipeline, PipelineType } from 'aws-cdk-lib/aws-codepipeline';
import { PolicyStatement, Effect } from 'aws-cdk-lib/aws-iam';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import {
  CodeBuildStep,
  CodePipeline,
  CodePipelineSource,
  ManualApprovalStep,
} from 'aws-cdk-lib/pipelines';
import { Construct } from 'constructs';
import { ApplicationStack, ApplicationStackProps } from './application-stack';
import { accountIdAlias, AppStage, getAppStackConfig, REGION } from '../config';

export class InfrastructurePipelineStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    const ghBranchName = 'main';

    // A connection where the pipeline get its source code
    const codeStarArn = StringParameter.valueForStringParameter(this, 'codestar_github_arn');
    const codeStarSourceActionName = 'infra-src';
    const sourceFile = CodePipelineSource.connection('OrcaBus/orca-ui', ghBranchName, {
      connectionArn: codeStarArn,
      actionName: codeStarSourceActionName,
      triggerOnPush: true,
    });

    /**
     * Infrastructure Pipeline
     * This pipeline is used to deploy the infrastructure, and it is triggered by a push event from the CodeStar connection.
     * Note: only push event from `deploy` directory will trigger this pipeline, as it is used for infra pipeline deployment
     */
    const infraCodePipeline = new Pipeline(this, 'InfraCodePipeline', {
      pipelineType: PipelineType.V2,
      pipelineName: 'OrcaUIInfrastructure',
      crossAccountKeys: true,
    });

    // Add event filter to only trigger if the push event is from `deploy` directory
    const infraCfnPipeline = infraCodePipeline.node.defaultChild as CfnPipeline;
    infraCfnPipeline.addPropertyOverride('Triggers', [
      {
        GitConfiguration: {
          Push: [
            {
              Branches: {
                Includes: [ghBranchName],
              },
              FilePaths: {
                Includes: ['deploy/**'],
              },
            },
          ],
          SourceActionName: codeStarSourceActionName,
        },
        ProviderType: 'CodeStarSourceConnection',
      },
    ]);

    const infraCDKPipeline = new CodePipeline(this, 'InfraCDKPipeline', {
      codePipeline: infraCodePipeline,
      synth: new CodeBuildStep('CdkSynth', {
        installCommands: ['node -v', 'corepack enable'],
        commands: ['cd deploy', 'yarn install --immutable', 'yarn cdk synth'],
        input: sourceFile,
        primaryOutputDirectory: 'deploy/cdk.out',
        rolePolicyStatements: [
          new PolicyStatement({
            effect: Effect.ALLOW,
            actions: ['sts:AssumeRole'],
            resources: ['*'],
          }),
        ],
      }),
      selfMutation: true,
      codeBuildDefaults: {
        buildEnvironment: {
          computeType: ComputeType.LARGE,
          buildImage: LinuxArmBuildImage.AMAZON_LINUX_2_STANDARD_3_0,
          environmentVariables: {
            NODE_OPTIONS: {
              value: '--max-old-space-size=8192',
            },
          },
        },
      },
    });

    /**
     * Deployment to Beta (Dev) account
     */
    const betaConfig = getAppStackConfig(AppStage.BETA);
    infraCDKPipeline.addStage(
      new DeploymentStage(
        this,
        'OrcaUIBeta',
        {
          account: accountIdAlias.beta,
          region: REGION,
        },
        betaConfig
      )
    );

    /**
     * Deployment to Gamma (Staging) account
     */
    const gammaConfig = getAppStackConfig(AppStage.GAMMA);
    infraCDKPipeline.addStage(
      new DeploymentStage(
        this,
        'OrcaUIGamma',
        {
          account: accountIdAlias.gamma,
          region: REGION,
        },
        gammaConfig
      ),
      {
        post: [new ManualApprovalStep('Promote to Prod (Production)')],
      }
    );

    /**
     * Deployment to Prod (Production) account
     */
    const prodConfig = getAppStackConfig(AppStage.PROD);
    infraCDKPipeline.addStage(
      new DeploymentStage(
        this,
        'OrcaUIProd',
        {
          account: accountIdAlias.prod,
          region: REGION,
        },
        prodConfig
      )
    );
  }
}

export class DeploymentStage extends Stage {
  constructor(
    scope: Construct,
    environmentName: string,
    env: Environment,
    appStackProps: ApplicationStackProps
  ) {
    super(scope, environmentName, { env: env });
    new ApplicationStack(this, 'ApplicationStack', {
      env: env,
      tags: {
        'umccr-org:Product': 'OrcaUI',
        'umccr-org:Creator': 'CDK',
      },
      ...appStackProps,
    });
  }
}
