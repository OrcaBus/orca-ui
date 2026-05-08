#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { InfrastructurePipelineStack } from './lib/infrastructure-pipeline-stack';
import { OrcaUICodePipelineStack } from './lib/orca-ui-code-pipeline-stack';
import { OrcaUIV2CodePipelineStack } from './lib/orca-ui-v2-code-pipeline-stack';
import { TOOLCHAIN_ACCOUNT_ID, REGION } from './config';

const app = new cdk.App();

new InfrastructurePipelineStack(app, 'OrcaUIInfrastructurePipeline', {
  env: {
    account: TOOLCHAIN_ACCOUNT_ID,
    region: REGION,
  },
  tags: {
    'umccr-org:Stack': 'OrcaUIInfrastructurePipeline',
    'umccr-org:Product': 'OrcaUI',
  },
});

new OrcaUICodePipelineStack(app, 'OrcaUICodePipeline', {
  env: {
    account: TOOLCHAIN_ACCOUNT_ID,
    region: REGION,
  },
  tags: {
    'umccr-org:Stack': 'OrcaUICodePipeline',
    'umccr-org:Product': 'OrcaUI',
  },
});

new OrcaUIV2CodePipelineStack(app, 'OrcaUIV2CodePipeline', {
  env: {
    account: TOOLCHAIN_ACCOUNT_ID,
    region: REGION,
  },
  tags: {
    'umccr-org:Stack': 'OrcaUIV2CodePipeline',
    'umccr-org:Product': 'OrcaUI',
  },
});
