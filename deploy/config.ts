import { ApplicationStackProps } from './lib/application-stack';

export enum AppStage {
  BETA = 'beta',
  GAMMA = 'gamma',
  PROD = 'prod',
}

export const TOOLCHAIN_ACCOUNT_ID = '383856791668'; // umccr_bastion

export const accountIdAlias: Record<AppStage, string> = {
  [AppStage.BETA]: '843407916570', // umccr_development
  [AppStage.GAMMA]: '455634345446', // umccr_staging
  [AppStage.PROD]: '472057503814', // umccr_production
};

export const REGION = 'ap-southeast-2';

export const cloudFrontBucketNameConfig: Record<AppStage, string> = {
  [AppStage.BETA]: 'orcaui-cloudfront-843407916570',
  [AppStage.GAMMA]: 'orcaui-cloudfront-455634345446',
  [AppStage.PROD]: 'orcaui-cloudfront-472057503814',
};

export const configLambdaNameConfig: Record<AppStage, string> = {
  [AppStage.BETA]: 'CodeBuildEnvConfigLambdaBeta',
  [AppStage.GAMMA]: 'CodeBuildEnvConfigLambdaGamma',
  [AppStage.PROD]: 'CodeBuildEnvConfigLambdaProd',
};

export const getAppStackConfig = (appStage: AppStage): ApplicationStackProps => {
  switch (appStage) {
    case AppStage.BETA:
      return {
        cloudFrontBucketName: cloudFrontBucketNameConfig[appStage],
        configLambdaName: configLambdaNameConfig[appStage],
        aliasDomainName: ['orcaui.dev.umccr.org', 'portal.dev.umccr.org'],
        reactBuildEnvVariables: {
          VITE_METADATA_URL: `https://metadata.dev.umccr.org`,
          VITE_WORKFLOW_URL: `https://workflow.dev.umccr.org`,
          VITE_SEQUENCE_RUN_URL: `https://sequence.dev.umccr.org`,
          VITE_FILE_URL: `https://file.dev.umccr.org`,
          VITE_SSCHECK_URL: `https://sscheck-orcabus.dev.umccr.org`,
          VITE_HTSGET_URL: `https://htsget-file.dev.umccr.org`,
          VITE_CASE_URL: `https://case.dev.umccr.org`,
        },
      };

    case AppStage.GAMMA:
      return {
        cloudFrontBucketName: cloudFrontBucketNameConfig[appStage],
        configLambdaName: configLambdaNameConfig[appStage],
        aliasDomainName: ['orcaui.stg.umccr.org', 'portal.stg.umccr.org'],
        reactBuildEnvVariables: {
          VITE_METADATA_URL: `https://metadata.stg.umccr.org`,
          VITE_WORKFLOW_URL: `https://workflow.stg.umccr.org`,
          VITE_SEQUENCE_RUN_URL: `https://sequence.stg.umccr.org`,
          VITE_FILE_URL: `https://file.stg.umccr.org`,
          VITE_SSCHECK_URL: `https://sscheck-orcabus.stg.umccr.org`,
          VITE_CASE_URL: `https://case.stg.umccr.org`,
        },
      };

    case AppStage.PROD:
      return {
        cloudFrontBucketName: cloudFrontBucketNameConfig[appStage],
        configLambdaName: configLambdaNameConfig[appStage],
        aliasDomainName: [
          'orcaui.umccr.org',
          'orcaui.prod.umccr.org',
          'portal.umccr.org',
          'portal.prod.umccr.org',
        ],
        reactBuildEnvVariables: {
          VITE_METADATA_URL: `https://metadata.prod.umccr.org`,
          VITE_WORKFLOW_URL: `https://workflow.prod.umccr.org`,
          VITE_SEQUENCE_RUN_URL: `https://sequence.prod.umccr.org`,
          VITE_FILE_URL: `https://file.prod.umccr.org`,
          VITE_SSCHECK_URL: `https://sscheck-orcabus.prod.umccr.org`,
          VITE_CASE_URL: `https://case.prod.umccr.org`,
        },
      };
  }
};
