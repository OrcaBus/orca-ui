import config from '@/config';
import createClient from 'openapi-fetch';
import type { components, paths } from './types/case';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { authMiddleware, UseSuspenseQueryOptions } from './utils';

const client = createClient<paths>({
  baseUrl: config.apiEndpoint.case,
});
client.use(authMiddleware);

const casePath = '/api/v1/case/';
export function useQueryCaseListObject({
  params,
  reactQuery,
}: UseSuspenseQueryOptions<paths[typeof casePath]['get']>) {
  return useSuspenseQuery({
    ...reactQuery,
    queryKey: ['GET', casePath, params],
    queryFn: async ({ signal }) => {
      const { data, error, response } = await client.GET(casePath, {
        params,
        signal, // allows React Query to cancel request
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
}

export const caseDetailPath = '/api/v1/case/{orcabusId}/';
export function useQueryCaseDetailObject({
  params,
  reactQuery,
}: UseSuspenseQueryOptions<paths[typeof caseDetailPath]['get']>) {
  return useSuspenseQuery({
    ...reactQuery,
    queryKey: ['GET', caseDetailPath, params],
    queryFn: async ({ signal }) => {
      const { data, error, response } = await client.GET(caseDetailPath, {
        // @ts-expect-error: params is dynamic type type for openapi-fetch
        params,
        signal, // allows React Query to cancel request
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
}

export function useMutationCaseUpdate({
  orcabusId,
  body,
  reactQuery,
}: {
  orcabusId: string;
  body: components['schemas']['PatchedCaseDetailRequest'];
  reactQuery?: {
    onSuccess?: (data: components['schemas']['CaseDetail']) => void;
    onError?: (error: Error) => void;
  };
}) {
  return useMutation({
    ...reactQuery,
    mutationFn: async () => {
      const { data, error, response } = await client.PATCH('/api/v1/case/{orcabusId}/', {
        params: { path: { orcabusId } },
        body,
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
}

export function useMutationCaseUnlinkEntity({
  caseOrcabusId,
  externalEntityOrcabusId,
  reactQuery,
}: {
  caseOrcabusId: string;
  externalEntityOrcabusId: string;
  reactQuery?: {
    onSuccess?: () => void;
    onError?: (error: Error) => void;
  };
}) {
  return useMutation({
    ...reactQuery,
    mutationFn: async () => {
      const { data, error, response } = await client.DELETE(
        '/api/v1/case/{orcabusId}/external-entity/{externalEntityOrcabusId}/',
        {
          params: {
            path: { orcabusId: caseOrcabusId, externalEntityOrcabusId: externalEntityOrcabusId },
          },
        }
      );

      if (error) {
        if (typeof error === 'object') {
          throw new Error(JSON.stringify(error));
        }
        throw new Error((response as Response).statusText);
      }

      return data;
    },
  });
}

export function useMutationCaseLinkEntity({
  reactQuery,
}: {
  reactQuery?: {
    onSuccess?: () => void;
    onError?: (error: Error) => void;
  };
}) {
  return useMutation({
    ...reactQuery,
    mutationFn: async (body: components['schemas']['CaseExternalEntityLinkCreateRequest']) => {
      const { data, error, response } = await client.POST('/api/v1/case/link/external-entity/', {
        body,
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
}
