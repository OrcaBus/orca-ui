import { Construct } from 'constructs';
import { DeploymentStackPipeline } from '@orcabus/platform-cdk-constructs/deployment-stack-pipeline';
import { InfrastructureStack } from './infrastructure-stack';
import { getInfrastructureStackConfig, AppStage } from '../config';
import { Stack, StackProps } from 'aws-cdk-lib';

export class InfrastructureDeploymentStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const deployInstallCommands = [
      'node -v',
      'corepack enable',
      'yarn --cwd deploy --version',
      'yarn --cwd deploy install --immutable',
    ];

    new DeploymentStackPipeline(this, 'DeploymentPipeline', {
      githubBranch: 'main',
      githubRepo: 'orca-ui',
      includedFilePaths: ['deploy/**'],
      stack: InfrastructureStack,
      stackName: 'OrcaUIInfrastructureStack',
      stackConfig: {
        beta: getInfrastructureStackConfig(AppStage.BETA),
        gamma: getInfrastructureStackConfig(AppStage.GAMMA),
        prod: getInfrastructureStackConfig(AppStage.PROD),
      },
      pipelineName: 'OrcaBus-OrcaUIInfrastructure',
      synthInstallCommands: deployInstallCommands,
      cdkSynthCmd: ['yarn --cwd deploy cdk synth'],
      cdkOut: 'deploy/cdk.out',
      enableSlackNotification: true,
      unitIacTestConfig: {
        command: ['yarn --cwd deploy run test'],
        installCommands: deployInstallCommands,
      },
      unitAppTestConfig: {
        command: ['echo "Application tests are handled by the app deployment pipelines"'],
        installCommands: [],
      },
    });
  }
}
