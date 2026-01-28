import { env } from '@/utils/commonUtils';

const REGION = env.VITE_REGION;
const OAUTH_DOMAIN = `${env.VITE_OAUTH_DOMAIN}.auth.${REGION}.amazoncognito.com`;

const config = {
  region: REGION,
  apiEndpoint: {
    metadata: env.VITE_METADATA_URL,
    workflow: env.VITE_WORKFLOW_URL,
    sequenceRun: env.VITE_SEQUENCE_RUN_URL,
    file: env.VITE_FILE_URL,
    sscheck: env.VITE_SSCHECK_URL,
    htsget: env.VITE_HTSGET_URL,
    case: env.VITE_CASE_URL,
  },
  cognito: {
    REGION: REGION,
    USER_POOL_ID: env.VITE_COG_USER_POOL_ID,
    APP_CLIENT_ID: env.VITE_COG_APP_CLIENT_ID,
    OAUTH: {
      domain: OAUTH_DOMAIN,
      scopes: ['email', 'openid', 'aws.cognito.signin.user.admin', 'profile'],
      redirectSignIn: [env.VITE_OAUTH_REDIRECT_IN],
      redirectSignOut: [env.VITE_OAUTH_REDIRECT_OUT],
      responseType: 'code' as const,
    },
  },
};

export default config;

export { REGION };
