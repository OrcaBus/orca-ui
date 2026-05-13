# OrcaUI Deployment

This directory contains the AWS CDK app for OrcaUI hosting infrastructure and CI/CD pipelines.

## Overview

The CDK app is composed in [`bin.ts`](./bin.ts) and creates three top-level pipeline stacks in the toolchain account:

| CDK stack                      | CodePipeline name              | Source repository           | Trigger              | Purpose                                                                                 |
| ------------------------------ | ------------------------------ | --------------------------- | -------------------- | --------------------------------------------------------------------------------------- |
| `OrcaUIInfrastructurePipeline` | `OrcaBus-OrcaUIInfrastructure` | `OrcaBus/orca-ui` `main`    | `deploy/**` only     | Synthesizes CDK and deploys `InfrastructureStack` to beta, gamma, and prod.             |
| `OrcaUIAppPipeline`            | `OrcaUIAppCICDPipeline`        | `OrcaBus/orca-ui` `main`    | excludes `deploy/**` | Builds and deploys the current UI app to the primary CloudFront bucket.                 |
| `OrcaUIV2AppPipeline`          | `OrcaUIV2AppCICDPipeline`      | `OrcaBus/orca-ui-v2` `main` | excludes `deploy/**` | Builds and deploys UI v2 to the configured v2 CloudFront bucket under the `v2/` prefix. |

`InfrastructureStack` owns the hosted app infrastructure in each target account:

- S3 bucket for the current UI app.
- Optional v2 S3 bucket when `v2CloudFrontBucketName` is configured.
- Shared CloudFront distribution and Route 53 aliases.
- CloudFront Function for SPA routing, including `/v2/...` routes.
- Env config Lambda for `env.js`, optional `v2/env.js`, and CloudFront invalidation.

## Deployment Strategy

Infrastructure changes flow through `OrcaUIInfrastructurePipeline`:

1. A push to `OrcaBus/orca-ui` on `main` under `deploy/**` triggers the infrastructure pipeline.
2. The pipeline runs `cd deploy`, installs dependencies, and runs `yarn cdk synth`.
3. CDK self-mutation updates the pipeline when needed.
4. `InfrastructureStack` is deployed to beta, gamma, then prod. Gamma has a manual approval before promotion to prod.

Application code deploys independently:

- `OrcaUIAppPipeline` builds `OrcaBus/orca-ui`, syncs the `dist/` artifact to the primary bucket root, then invokes the env config Lambda.
- `OrcaUIV2AppPipeline` builds `OrcaBus/orca-ui-v2`, syncs the `build/` artifact to `s3://<v2-bucket>/v2/`, then invokes the same env config Lambda.

UI v2 is currently enabled only where `v2CloudFrontBucketNameConfig` is set in [`config.ts`](./config.ts). See [`docs/ui-v2-deployment-strategy.md`](../docs/ui-v2-deployment-strategy.md) for the dual-bucket `/v2/` hosting details.

## Env Config Lambda

The env config Lambda is defined in [`lambda/env_config_and_cdn_refresh.py`](./lambda/env_config_and_cdn_refresh.py).

The app deploy CodeBuild projects invoke this Lambda after syncing assets to S3. The Lambda:

- writes `env.js` to the primary UI bucket;
- writes `v2/env.js` to the v2 bucket when `V2_BUCKET_NAME` is set;
- creates a CloudFront invalidation for the shared distribution.

Invoke manually without a payload:

```sh
aws lambda invoke \
  --function-name CodeBuildEnvConfigLambdaBeta \
  response.json
```

Invoke manually with a payload to update API versions:

```sh
aws lambda invoke \
  --function-name CodeBuildEnvConfigLambdaBeta \
  --cli-binary-format raw-in-base64-out \
  --payload '{"metadata_api_version": "v2"}' \
  response.json
```

Update multiple API versions:

```sh
aws lambda invoke \
  --function-name CodeBuildEnvConfigLambdaBeta \
  --cli-binary-format raw-in-base64-out \
  --payload '{
    "metadata_api_version": "v2",
    "workflow_api_version": "v2",
    "sequence_run_api_version": "v1",
    "file_api_version": "v2"
  }' \
  response.json
```

Invoke with a specific AWS profile:

```sh
aws lambda invoke \
  --profile your-profile-name \
  --function-name CodeBuildEnvConfigLambdaBeta \
  --cli-binary-format raw-in-base64-out \
  --payload '{"metadata_api_version": "v2"}' \
  response.json
```

Use the stage-specific function name when targeting another environment:

- `CodeBuildEnvConfigLambdaBeta`
- `CodeBuildEnvConfigLambdaGamma`
- `CodeBuildEnvConfigLambdaProd`

## Development

Change to the deploy directory:

```sh
cd deploy
```

Install dependencies:

```sh
corepack enable
yarn install --immutable
```

Run tests:

```sh
yarn test
```

List CDK stacks:

```sh
yarn cdk ls
```

Example stack output:

```sh
OrcaUIInfrastructurePipeline
OrcaUIAppPipeline
OrcaUIV2AppPipeline
OrcaUIInfrastructurePipeline/DeploymentPipeline/OrcaBusBeta/OrcaUIInfrastructureStack (OrcaBusBeta-OrcaUIInfrastructureStack)
OrcaUIInfrastructurePipeline/DeploymentPipeline/OrcaBusGamma/OrcaUIInfrastructureStack (OrcaBusGamma-OrcaUIInfrastructureStack)
OrcaUIInfrastructurePipeline/DeploymentPipeline/OrcaBusProd/OrcaUIInfrastructureStack (OrcaBusProd-OrcaUIInfrastructureStack)
```

Deploy the top-level pipeline stacks:

```sh
yarn cdk deploy -e OrcaUIInfrastructurePipeline
yarn cdk deploy -e OrcaUIAppPipeline
yarn cdk deploy -e OrcaUIV2AppPipeline
```

Work directly with the beta infrastructure stack:

```sh
yarn cdk synth -e OrcaUIInfrastructurePipeline/DeploymentPipeline/OrcaBusBeta/OrcaUIInfrastructureStack
yarn cdk diff -e OrcaUIInfrastructurePipeline/DeploymentPipeline/OrcaBusBeta/OrcaUIInfrastructureStack
yarn cdk deploy -e OrcaUIInfrastructurePipeline/DeploymentPipeline/OrcaBusBeta/OrcaUIInfrastructureStack
```

Direct application stack deploys require AWS credentials for the target account and the usual CDK bootstrap roles.

## Migration Note

The CDK app now uses three top-level stack IDs instead of the older combined `OrcaUIPipeline` stack, and the app CI/CD stacks are named `OrcaUIAppPipeline` and `OrcaUIV2AppPipeline`. If older pipeline stacks already exist in AWS, do not deploy the new stacks blindly: named resources such as CodePipeline and CodeBuild projects may still be owned by an old stack. Plan the migration so ownership of existing resources is handled intentionally.
