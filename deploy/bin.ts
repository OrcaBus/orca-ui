#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { InfrastructureDeploymentStack } from './lib/infrastructure-deployment-stack';
import { OrcaUIAppPipelineStack } from './lib/orca-ui-app-pipeline-stack';
import { OrcaUIV2AppPipelineStack } from './lib/orca-ui-v2-app-pipeline-stack';
import { TOOLCHAIN_ACCOUNT_ID, REGION } from './config';

const app = new cdk.App();

new InfrastructureDeploymentStack(app, 'OrcaUIInfrastructurePipeline', {
  env: {
    account: TOOLCHAIN_ACCOUNT_ID,
    region: REGION,
  },
  tags: {
    'umccr-org:Stack': 'OrcaUIInfrastructurePipeline',
    'umccr-org:Product': 'OrcaUI',
  },
});

new OrcaUIAppPipelineStack(app, 'OrcaUIAppPipeline', {
  env: {
    account: TOOLCHAIN_ACCOUNT_ID,
    region: REGION,
  },
  tags: {
    'umccr-org:Stack': 'OrcaUIAppPipeline',
    'umccr-org:Product': 'OrcaUI',
  },
});

new OrcaUIV2AppPipelineStack(app, 'OrcaUIV2AppPipeline', {
  env: {
    account: TOOLCHAIN_ACCOUNT_ID,
    region: REGION,
  },
  tags: {
    'umccr-org:Stack': 'OrcaUIV2AppPipeline',
    'umccr-org:Product': 'OrcaUI',
  },
});
