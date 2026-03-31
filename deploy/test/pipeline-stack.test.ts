import { App, Aspects, Stack } from 'aws-cdk-lib';
import { Annotations, Match } from 'aws-cdk-lib/assertions';
import { SynthesisMessage } from '@aws-cdk/cloud-assembly-api';
import { AwsSolutionsChecks, NagSuppressions } from 'cdk-nag';
import { PipelineStack } from '../lib/pipeline-stack';

// we are mocking the deployment stack here, as we have a dedicated cdk-nag test for deployment stack
jest.mock('../lib/application-stack', () => {
  return {
    ApplicationStack: jest.fn().mockImplementation((value) => {
      return new Stack(value, 'mockStack', {});
    }),
  };
});

function synthesisMessageToString(sm: SynthesisMessage): string {
  return `${sm.entry.data} [${sm.id}]`;
}

describe('cdk-nag-stack', () => {
  const app: App = new App({});
  const stack = new PipelineStack(app, 'TestStack', {
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
});
