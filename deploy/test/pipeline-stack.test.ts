import { App, Aspects, Stack, StackProps } from 'aws-cdk-lib';
import { Annotations, Match, Template } from 'aws-cdk-lib/assertions';
import { SynthesisMessage } from '@aws-cdk/cloud-assembly-api';
import { describe, expect, jest, test } from '@jest/globals';
import { AwsSolutionsChecks, NagSuppressions } from 'cdk-nag';
import type { Construct } from 'constructs';
import { InfrastructureDeploymentStack } from '../lib/infrastructure-deployment-stack';
import { OrcaUIAppPipelineStack } from '../lib/orca-ui-app-pipeline-stack';
import { OrcaUIV2AppPipelineStack } from '../lib/orca-ui-v2-app-pipeline-stack';
import { AppStage, v2CloudFrontBucketNameConfig } from '../config';

// we are mocking the infrastructure stack here, as we have a dedicated cdk-nag test for it
jest.mock('../lib/infrastructure-stack', () => {
  return {
    InfrastructureStack: jest.fn((value: Construct) => {
      return new Stack(value, 'mockStack', {});
    }),
  };
});

function synthesisMessageToString(sm: SynthesisMessage): string {
  return `${sm.entry.data} [${sm.id}]`;
}

type PipelineStackConstructor = new (scope: App, id: string, props: StackProps) => Stack;
type PipelineFilePaths = { Includes?: string[]; Excludes?: string[] };
type CfnResource = { Properties?: Record<string, unknown> };
type PipelineAction = {
  Name: string;
  ActionTypeId?: {
    Category?: string;
  };
  Configuration?: Record<string, unknown>;
};
type PipelineStage = {
  Name: string;
  Actions: PipelineAction[];
};
type PipelineProperties = {
  PipelineType?: string;
  Stages: PipelineStage[];
  Triggers?: unknown[];
};
type CodeBuildProjectProperties = {
  Name?: string;
  Source: {
    BuildSpec?: string;
  };
  Environment?: {
    EnvironmentVariables?: Array<Record<string, unknown>>;
  };
};
type IamRoleProperties = {
  AssumeRolePolicyDocument?: {
    Statement?: Array<{
      Action?: string | string[];
      Principal?: Record<string, unknown>;
    }>;
  };
};

const configuredV2DeployStages = Object.values(AppStage).flatMap((appStage) => {
  if (!v2CloudFrontBucketNameConfig[appStage]) {
    return [];
  }

  if (appStage === AppStage.PROD) {
    return ['DeployToProdApproval', 'DeployToProd'];
  }

  return [`DeployTo${stageLabel(appStage)}`];
});

const pipelineStacks: {
  stackId: string;
  StackClass: PipelineStackConstructor;
  pipelineName: string;
  repository: string;
  sourceActionName: string;
  filePaths: PipelineFilePaths;
  expectedStages: string[];
  exactStages?: boolean;
}[] = [
  {
    stackId: 'TestInfrastructureDeploymentStack',
    StackClass: InfrastructureDeploymentStack,
    pipelineName: 'OrcaBus-OrcaUIInfrastructure',
    repository: 'OrcaBus/orca-ui',
    sourceActionName: 'pipeline-src',
    filePaths: { Includes: ['deploy/**'] },
    expectedStages: ['Source', 'Build', 'OrcaBusBeta', 'OrcaBusGamma', 'OrcaBusProd'],
  },
  {
    stackId: 'TestOrcaUIAppPipelineStack',
    StackClass: OrcaUIAppPipelineStack,
    pipelineName: 'OrcaUIAppCICDPipeline',
    repository: 'OrcaBus/orca-ui',
    sourceActionName: 'orcauiAppSrc',
    filePaths: { Excludes: ['deploy/**'] },
    expectedStages: ['Source', 'Build', 'DeployToBeta', 'DeployToGamma', 'DeployToProd'],
    exactStages: true,
  },
  {
    stackId: 'TestOrcaUIV2AppPipelineStack',
    StackClass: OrcaUIV2AppPipelineStack,
    pipelineName: 'OrcaUIV2AppCICDPipeline',
    repository: 'OrcaBus/orca-ui-v2',
    sourceActionName: 'orcauiV2AppSrc',
    filePaths: { Excludes: ['deploy/**'] },
    expectedStages: ['Source', 'Build', ...configuredV2DeployStages],
    exactStages: true,
  },
];

describe.each(pipelineStacks)(
  '$stackId cdk-nag-stack',
  ({
    stackId,
    StackClass,
    pipelineName,
    repository,
    sourceActionName,
    filePaths,
    expectedStages,
    exactStages,
  }) => {
    const app: App = new App({});
    const stack = new StackClass(app, stackId, {
      env: {
        account: '123456789',
        region: 'ap-southeast-2',
      },
    });

    Aspects.of(stack).add(new AwsSolutionsChecks());
    NagSuppressions.addStackSuppressions(stack, [
      { id: 'AwsSolutions-IAM4', reason: 'Allow CDK Pipeline' },
      { id: 'AwsSolutions-IAM5', reason: 'Allow CDK Pipeline' },
      { id: 'AwsSolutions-S1', reason: 'Allow CDK Pipeline' },
      { id: 'AwsSolutions-KMS5', reason: 'Allow CDK Pipeline' },
      { id: 'AwsSolutions-CB3', reason: 'Allow CDK Pipeline' },
      { id: 'AwsSolutions-CB4', reason: 'Allow CDK Pipeline' },
    ]);

    test('cdk-nag AwsSolutions Pack errors', () => {
      const errors = Annotations.fromStack(stack)
        .findError('*', Match.stringLikeRegexp('AwsSolutions-.*'))
        .map(synthesisMessageToString);
      expect(errors).toHaveLength(0);
    });

    test('cdk-nag AwsSolutions Pack warnings', () => {
      const warnings = Annotations.fromStack(stack)
        .findWarning('*', Match.stringLikeRegexp('AwsSolutions-.*'))
        .map(synthesisMessageToString);
      expect(warnings).toHaveLength(0);
    });

    test('synthesizes expected CodePipeline source, stages, and trigger', () => {
      const template = Template.fromStack(stack);
      const pipeline = getPipelineProperties(template, pipelineName);
      const stages = pipeline.Stages.map((stage) => stage.Name);
      const sourceAction = pipeline.Stages[0].Actions[0];

      expect(pipeline.PipelineType).toBe('V2');
      expect(sourceAction.Configuration).toMatchObject({
        FullRepositoryId: repository,
        BranchName: 'main',
      });

      if (exactStages) {
        expect(stages).toEqual(expectedStages);
      } else {
        expect(stages).toEqual(expect.arrayContaining(expectedStages));
      }

      expect(pipeline.Triggers).toEqual([
        {
          GitConfiguration: {
            Push: [
              {
                Branches: {
                  Includes: ['main'],
                },
                FilePaths: filePaths,
              },
            ],
            SourceActionName: sourceActionName,
          },
          ProviderType: 'CodeStarSourceConnection',
        },
      ]);
    });
  }
);

describe('InfrastructureDeploymentStack build command behavior', () => {
  const app: App = new App({});
  const stack = new InfrastructureDeploymentStack(app, 'TestInfrastructureBuildCommands', {
    env: {
      account: '123456789',
      region: 'ap-southeast-2',
    },
  });

  test('uses deploy Yarn commands instead of default root pnpm commands', () => {
    const buildSpecs = getCodeBuildProjectBuildSpecs(Template.fromStack(stack)).join('\n');

    expect(buildSpecs).toContain('"cd deploy"');
    expect(buildSpecs).toContain('"yarn install --immutable"');
    expect(buildSpecs).toContain('"yarn cdk synth"');
    expect(buildSpecs).toContain('"yarn run test"');
    expect(buildSpecs).not.toContain('pnpm test');
    expect(buildSpecs).not.toContain('pnpm install --frozen-lockfile');
  });
});

describe('OrcaUIAppPipelineStack deployment behavior', () => {
  const app: App = new App({});
  const stack = new OrcaUIAppPipelineStack(app, 'TestOrcaUIAppDeploymentBehavior', {
    env: {
      account: '123456789',
      region: 'ap-southeast-2',
    },
  });

  test('deploys stages with sync delete and checked Lambda invocation', () => {
    const codeBuildProjects = getCodeBuildProjectPropertiesByName(Template.fromStack(stack));

    for (const appStage of Object.values(AppStage)) {
      const project = codeBuildProjects[`ReactDeployProject${appStage}`];
      expect(project).toBeDefined();
      expect(project.Source.BuildSpec).toContain(
        'aws s3 sync . s3://${DESTINATION_BUCKET_NAME} --delete'
      );
      expect(project.Source.BuildSpec).toContain('invoke-result.json');
      expect(project.Source.BuildSpec).toContain("payload.get('statusCode') != 200");
      expect(project.Source.BuildSpec).toContain("meta.get('FunctionError')");
    }
  });

  test('deploy roles are only assumable by CodeBuild', () => {
    const template = Template.fromStack(stack);

    for (const appStage of Object.values(AppStage)) {
      const role = getIamRoleProperties(template, `ReactDeployProjectRole${appStage}`);
      const statements = role.AssumeRolePolicyDocument?.Statement ?? [];

      expect(statements).toEqual([
        expect.objectContaining({
          Action: 'sts:AssumeRole',
          Principal: {
            Service: 'codebuild.amazonaws.com',
          },
        }),
      ]);
      expect(statements).not.toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            Principal: expect.objectContaining({
              AWS: expect.anything(),
            }),
          }),
        ])
      );
    }
  });
});

describe('OrcaUIV2AppPipelineStack deployment behavior', () => {
  const app: App = new App({});
  const stack = new OrcaUIV2AppPipelineStack(app, 'TestOrcaUIV2DeploymentBehavior', {
    env: {
      account: '123456789',
      region: 'ap-southeast-2',
    },
  });

  test('builds from the v2 build directory', () => {
    const buildProject = getCodeBuildProjectProperties(
      Template.fromStack(stack),
      'OrcaUIV2BuildProject'
    );
    const buildSpec = buildProject.Source.BuildSpec;

    expect(buildSpec).toContain('"pnpm build"');
    expect(buildSpec).toContain('"base-directory": "build/"');
  });

  test('deploys configured v2 stages under the v2 bucket prefix', () => {
    const codeBuildProjects = getCodeBuildProjectPropertiesByName(Template.fromStack(stack));
    const configuredStages = Object.values(AppStage).filter(
      (appStage) => v2CloudFrontBucketNameConfig[appStage]
    );

    for (const appStage of configuredStages) {
      const project = codeBuildProjects[`OrcaUIV2DeployProject${appStage}`];
      expect(project).toBeDefined();
      expect(project.Source.BuildSpec).toContain(
        'aws s3 sync . s3://${DESTINATION_BUCKET_NAME}/v2/ --delete'
      );
      expect(project.Source.BuildSpec).toContain('invoke-result.json');
      expect(project.Source.BuildSpec).toContain("payload.get('statusCode') != 200");
      expect(project.Source.BuildSpec).toContain("meta.get('FunctionError')");
      expect(project.Environment?.EnvironmentVariables ?? []).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            Name: 'DESTINATION_BUCKET_NAME',
            Value: v2CloudFrontBucketNameConfig[appStage],
          }),
        ])
      );
    }
  });

  test('requires manual approval immediately before prod deployment', () => {
    const pipeline = getPipelineProperties(Template.fromStack(stack), 'OrcaUIV2AppCICDPipeline');
    const prodStageIndex = pipeline.Stages.findIndex((stage) => stage.Name === 'DeployToProd');
    const approvalStage = pipeline.Stages[prodStageIndex - 1];

    expect(prodStageIndex).toBeGreaterThan(0);
    expect(approvalStage).toMatchObject({
      Name: 'DeployToProdApproval',
      Actions: [
        expect.objectContaining({
          Name: 'ApproveDeployToProd',
          ActionTypeId: expect.objectContaining({
            Category: 'Approval',
          }),
        }),
      ],
    });
  });

  test('v2 deploy roles are only assumable by CodeBuild', () => {
    const template = Template.fromStack(stack);
    const configuredStages = Object.values(AppStage).filter(
      (appStage) => v2CloudFrontBucketNameConfig[appStage]
    );

    for (const appStage of configuredStages) {
      const role = getIamRoleProperties(template, `OrcaUIV2DeployProjectRole${appStage}`);
      const statements = role.AssumeRolePolicyDocument?.Statement ?? [];

      expect(statements).toEqual([
        expect.objectContaining({
          Action: 'sts:AssumeRole',
          Principal: {
            Service: 'codebuild.amazonaws.com',
          },
        }),
      ]);
      expect(statements).not.toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            Principal: expect.objectContaining({
              AWS: expect.anything(),
            }),
          }),
        ])
      );
    }
  });
});

function getPipelineProperties(template: Template, pipelineName: string): PipelineProperties {
  const pipeline = Object.values(template.findResources('AWS::CodePipeline::Pipeline')).find(
    (resource) => cfnResourceProperties(resource).Name === pipelineName
  );

  expect(pipeline).toBeDefined();
  return cfnResourceProperties(pipeline) as PipelineProperties;
}

function getCodeBuildProjectProperties(
  template: Template,
  projectName: string
): CodeBuildProjectProperties {
  const project = getCodeBuildProjectPropertiesByName(template)[projectName];

  expect(project).toBeDefined();
  return project;
}

function getCodeBuildProjectPropertiesByName(
  template: Template
): Record<string, CodeBuildProjectProperties> {
  return Object.values(template.findResources('AWS::CodeBuild::Project')).reduce(
    (acc, resource) => {
      const properties = cfnResourceProperties(resource) as CodeBuildProjectProperties;
      const name = properties.Name;
      if (typeof name === 'string') {
        acc[name] = properties;
      }
      return acc;
    },
    {} as Record<string, CodeBuildProjectProperties>
  );
}

function getCodeBuildProjectBuildSpecs(template: Template): string[] {
  return Object.values(template.findResources('AWS::CodeBuild::Project'))
    .map((resource) => (cfnResourceProperties(resource) as CodeBuildProjectProperties).Source)
    .map((source) => source.BuildSpec)
    .filter((buildSpec): buildSpec is string => typeof buildSpec === 'string');
}

function getIamRoleProperties(template: Template, logicalIdPrefix: string): IamRoleProperties {
  const role = Object.entries(template.findResources('AWS::IAM::Role')).find(([logicalId]) =>
    logicalId.startsWith(logicalIdPrefix)
  )?.[1];

  expect(role).toBeDefined();
  return cfnResourceProperties(role) as IamRoleProperties;
}

function cfnResourceProperties(resource: unknown): Record<string, unknown> {
  return ((resource as CfnResource) ?? {}).Properties ?? {};
}

function stageLabel(appStage: AppStage): string {
  switch (appStage) {
    case AppStage.BETA:
      return 'Beta';
    case AppStage.GAMMA:
      return 'Gamma';
    case AppStage.PROD:
      return 'Prod';
  }
}
