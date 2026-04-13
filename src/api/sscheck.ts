import config from '@/config';
import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { ApiClient, assertOk } from './utils';

/** Minimal paths type for sscheck (no OpenAPI codegen for this service) */
interface SsCheckPaths {
  '/': {
    post: {
      parameters: { query?: never; header?: never; path?: never; cookie?: never };
      requestBody?: { content: { 'application/json': unknown } };
      responses: { 200: { content: { 'application/json': unknown } } };
    };
  };
}

/** Response type for sscheck validation (matches backend) */
export interface ValidationResponse {
  check_status: string;
  error_message?: string;
  log_file: string;
  v2_sample_sheet?: string;
}

const sscheckApi = new ApiClient<SsCheckPaths>({
  baseUrl: config.apiEndpoint.sscheck,
});

export function usePostSSCheck({
  body,
  reactQuery,
}: {
  body: Record<string, unknown> | FormData;
  reactQuery?: { onSuccess?: () => void; onError?: (error: Error) => void };
}): UseMutationResult<ValidationResponse, Error, void> {
  return useMutation({
    ...reactQuery,
    mutationFn: async () => {
      const { data, error, response } = await (sscheckApi.getClient().POST as CallableFunction)(
        sscheckApi.resolvePath('/'),
        { body }
      );
      return assertOk(data, error, response) as ValidationResponse;
    },
  });
}
