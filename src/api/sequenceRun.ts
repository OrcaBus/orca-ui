import config from '@/config';
import createClient, { ParamsOption } from 'openapi-fetch';
import type { components, paths } from './types/sequence-run';
import { useSuspenseQuery, useQuery, useMutation } from '@tanstack/react-query';
import {
  authMiddleware,
  UseSuspenseQueryOptions,
  UseQueryOptions,
  UseMutationOptions,
} from './utils';
import { env } from '@/utils/commonUtils';

const client = createClient<paths>({ baseUrl: config.apiEndpoint.sequenceRun });
client.use(authMiddleware);

const apiVersion = env.VITE_SEQUENCE_RUN_API_VERSION;

function getVersionedPath<K extends keyof paths>(path: K): K {
  if (!apiVersion) return path;
  return path.replace('/api/v1/', `/api/${apiVersion}/`) as K;
}

export function createSequenceRunFetchingHook<K extends keyof paths>(path: K) {
  return function ({ params, reactQuery }: UseSuspenseQueryOptions<paths[typeof path]['get']>) {
    const versionedPath = getVersionedPath(path);
    return useSuspenseQuery({
      ...reactQuery,
      queryKey: [path, params],
      queryFn: async ({ signal }) => {
        // @ts-expect-error: params is dynamic type type for openapi-fetch
        const { data, error, response } = await client.GET(versionedPath, { params, signal });

        if (error) {
          if (typeof error === 'object') {
            throw new Error(JSON.stringify(error));
          }
          throw new Error((response as Response).statusText);
        }
        return data;
      },
    });
  };
}

export function createSequenceRunQueryHook<
  K extends keyof paths,
  M extends keyof paths[K] & 'get',
  R = paths[K][M] extends { responses: { 200: { content: { 'application/json': infer T } } } }
    ? T
    : never,
>(path: K) {
  const versionedPath = getVersionedPath(path);
  return function ({
    params,
    reactQuery,
    signal,
  }: Omit<UseQueryOptions<paths[K][M]>, 'queryKey' | 'queryFn'> & { signal?: AbortSignal }) {
    return useQuery<R, Error, R, [K, typeof params]>({
      ...reactQuery,
      queryKey: [versionedPath, params],
      queryFn: async ({ signal: querySignal }) => {
        // @ts-expect-error: params is dynamic type type for openapi-fetch
        const { data, error, response } = await client.GET(versionedPath, {
          params: params as ParamsOption<paths[K][M]>,
          signal: signal || querySignal,
        });

        if (error) {
          if (typeof error === 'object') {
            throw new Error(JSON.stringify(error));
          }
          throw new Error((response as Response).statusText);
        }
        return data as R;
      },
    });
  };
}

export function createSequenceRunPostMutationHook<K extends keyof paths>(path: K) {
  return function ({ params, reactQuery, body }: UseMutationOptions<paths[typeof path]['post']>) {
    const versionedPath = getVersionedPath(path);
    return useMutation({
      ...reactQuery,
      mutationFn: async () => {
        // @ts-expect-error: params is dynamic type type for openapi-fetch
        const { data, error, response } = await client.POST(versionedPath, { params, body: body });

        if (error) {
          if (typeof error === 'object') {
            throw new Error(JSON.stringify(error));
          }
          throw new Error((response as Response).statusText);
        }
        return data;
      },
    });
  };
}

export function createSequenceRunPatchMutationHook<K extends keyof paths>(path: K) {
  return function ({ params, reactQuery, body }: UseMutationOptions<paths[typeof path]['patch']>) {
    const versionedPath = getVersionedPath(path);
    return useMutation({
      ...reactQuery,
      mutationFn: async () => {
        // @ts-expect-error: params is dynamic type type for openapi-fetch
        const { data, error, response } = await client.PATCH(versionedPath, { params, body: body });

        if (error) {
          if (typeof error === 'object') {
            throw new Error(JSON.stringify(error));
          }
          throw new Error((response as Response).statusText);
        }
        return data;
      },
    });
  };
}

export function createSequenceRunDeleteMutationHook<K extends keyof paths>(path: K) {
  return function ({ params, reactQuery, body }: UseMutationOptions<paths[typeof path]['delete']>) {
    const versionedPath = getVersionedPath(path);
    return useMutation({
      ...reactQuery,
      mutationFn: async () => {
        // @ts-expect-error: params is dynamic type type for openapi-fetch
        const { data, error, response } = await client.DELETE(versionedPath, {
          params,
          body: body,
        });

        if (error) {
          if (typeof error === 'object') {
            throw new Error(JSON.stringify(error));
          }
          throw new Error((response as Response).statusText);
        }
        return data;
      },
    });
  };
}

export type SequenceRunModel = components['schemas']['SequenceRun'];

export const useSequenceRunListModel = createSequenceRunQueryHook('/api/v1/sequence_run/');
export const useSequenceRunListByInstrumentRunIdModel = createSequenceRunQueryHook(
  '/api/v1/sequence_run/list_by_instrument_run_id/'
);
export const useSequenceRunDetailModel = createSequenceRunQueryHook(
  '/api/v1/sequence_run/{orcabusId}/'
);

// sequence run state
export const useSequenceRunStateListModel = createSequenceRunQueryHook(
  '/api/v1/sequence_run/{orcabusId}/state/'
);
export const useSequenceRunStateCreateModel = createSequenceRunPostMutationHook(
  '/api/v1/sequence_run/{orcabusId}/state/'
);
export const useSequenceRunStateUpdateModel = createSequenceRunPatchMutationHook(
  '/api/v1/sequence_run/{orcabusId}/state/{id}/'
);

// sequence run comment
export const useSequenceRunCommentListModel = createSequenceRunQueryHook(
  '/api/v1/sequence_run/{orcabusId}/comment/'
);
export const useSequenceRunCommentCreateModel = createSequenceRunPostMutationHook(
  '/api/v1/sequence_run/{orcabusId}/comment/'
);
export const useSequenceRunCommentUpdateModel = createSequenceRunPatchMutationHook(
  '/api/v1/sequence_run/{orcabusId}/comment/{id}/'
);
export const useSequenceRunCommentDeleteModel = createSequenceRunDeleteMutationHook(
  '/api/v1/sequence_run/{orcabusId}/comment/{id}/soft_delete/'
);

// status count
export const useSequenceRunStatusCountModel = createSequenceRunQueryHook(
  '/api/v1/sequence_run/stats/status_counts/'
);

// sample sheet
export const useSequenceRunSampleSheetModel = createSequenceRunQueryHook(
  '/api/v1/sequence_run/{orcabusId}/sample_sheet/'
);
export const useSequenceRunAddSampleSheetModel = createSequenceRunPostMutationHook(
  '/api/v1/sequence_run/action/add_samplesheet/'
);

// sequence - sequence runs, comments, states, smaplesheet (group by instrument run id)
export const useSequenceRunByInstrumentRunIdModel = createSequenceRunQueryHook(
  '/api/v1/sequence/{instrumentRunId}/sequence_run/'
);
export const useSequenceRunCommentsByInstrumentRunIdModel = createSequenceRunQueryHook(
  '/api/v1/sequence/{instrumentRunId}/comments/'
);
export const useSequenceRunStatesByInstrumentRunIdModel = createSequenceRunQueryHook(
  '/api/v1/sequence/{instrumentRunId}/states/'
);
export const useSequenceRunSampleSheetsByInstrumentRunIdModel = createSequenceRunQueryHook(
  '/api/v1/sequence/{instrumentRunId}/sample_sheets/'
);
export const useSequenceRunStateValidMapModel = createSequenceRunQueryHook(
  '/api/v1/sequence/{instrumentRunId}/valid_states_map/'
);
