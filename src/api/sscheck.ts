import config from '@/config';
import type { UseMutationResult } from '@tanstack/react-query';
import { ApiClient, createPostMutationHook } from './utils';

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
  params,
  body,
  reactQuery,
}: {
  params?: Record<string, unknown>;
  body: Record<string, unknown> | FormData;
  reactQuery?: { onSuccess?: () => void; onError?: (error: Error) => void };
}): UseMutationResult<ValidationResponse, Error, void> {
  const hook = createPostMutationHook(sscheckApi, '/');
  const result = hook({
    params,
    body: body as Record<string, unknown>,
    reactQuery,
  });
  return result as UseMutationResult<ValidationResponse, Error, void>;
}
