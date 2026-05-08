import { App, Aspects, Stack, StackProps } from 'aws-cdk-lib';
import { Annotations, Match, Template } from 'aws-cdk-lib/assertions';
import { SynthesisMessage } from '@aws-cdk/cloud-assembly-api';
import { describe, expect, jest, test } from '@jest/globals';
import { AwsSolutionsChecks, NagSuppressions } from 'cdk-nag';
import type { Construct } from 'constructs';
import { InfrastructurePipelineStack } from '../lib/infrastructure-pipeline-stack';
import { OrcaUICodePipelineStack } from '../lib/orca-ui-code-pipeline-stack';
import { OrcaUIV2CodePipelineStack } from '../lib/orca-ui-v2-code-pipeline-stack';
import { AppStage, v2CloudFrontBucketNameConfig } from '../config';

// we are mocking the deployment stack here, as we have a dedicated cdk-nag test for deployment stack
jest.mock('../lib/application-stack', () => {
  return {
    ApplicationStack: jest.fn((value: Construct) => {
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

const configuredV2DeployStages = Object.values(AppStage)
  .filter((appStage) => v2CloudFrontBucketNameConfig[appStage])
  .map((appStage) => `DeployTo${stageLabel(appStage)}`);

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
    stackId: 'TestInfrastructurePipelineStack',
    StackClass: InfrastructurePipelineStack,
    pipelineName: 'OrcaUIInfrastructure',
    repository: 'OrcaBus/orca-ui',
    sourceActionName: 'infra-src',
    filePaths: { Includes: ['deploy/**'] },
    expectedStages: ['Source', 'Build', 'OrcaUIBeta', 'OrcaUIGamma', 'OrcaUIProd'],
  },
  {
    stackId: 'TestOrcaUICodePipelineStack',
    StackClass: OrcaUICodePipelineStack,
    pipelineName: 'OrcaUICodeCICDPipeline',
    repository: 'OrcaBus/orca-ui',
    sourceActionName: 'orcauiAppSrc',
    filePaths: { Excludes: ['deploy/**'] },
    expectedStages: ['Source', 'Build', 'DeployToBeta', 'DeployToGamma', 'DeployToProd'],
    exactStages: true,
  },
  {
    stackId: 'TestOrcaUIV2CodePipelineStack',
    StackClass: OrcaUIV2CodePipelineStack,
    pipelineName: 'OrcaUIV2CodeCICDPipeline',
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

describe('OrcaUIV2CodePipelineStack deployment behavior', () => {
  const app: App = new App({});
  const stack = new OrcaUIV2CodePipelineStack(app, 'TestOrcaUIV2DeploymentBehavior', {
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
        'aws s3 rm s3://${DESTINATION_BUCKET_NAME}/v2/ --recursive && aws s3 sync . s3://${DESTINATION_BUCKET_NAME}/v2/'
      );
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
