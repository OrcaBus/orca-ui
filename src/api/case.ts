import config from '@/config';
import type { components, paths } from './types/case';
import { useMutation } from '@tanstack/react-query';
import { ApiClient, assertOk, createSuspenseQueryHook } from './utils';

const caseApi = new ApiClient<paths>({
  baseUrl: config.apiEndpoint.case,
});

export const casePath = '/api/v1/case/';
export const caseDetailPath = '/api/v1/case/{orcabusId}/';
export const caseHistoryPath = '/api/v1/case/{orcabusId}/history/';

// mutation
const caseExternalEntityPath =
  '/api/v1/case/{orcabusId}/external-entity/{externalEntityOrcabusId}/' as const;
const caseLinkPath = '/api/v1/case/link/external-entity/' as const;
const caseCreateStatePath = '/api/v1/state/' as const;

export const useQueryCaseListObject = createSuspenseQueryHook(caseApi, casePath);
export const useQueryCaseDetailObject = createSuspenseQueryHook(caseApi, caseDetailPath);
export const useQueryCaseHistoryObject = createSuspenseQueryHook(caseApi, caseHistoryPath);

// Mutations that take body at call time (mutate(body)) or fixed params - use getClient + assertOk
const getClient = () => caseApi.getClient();
const resolvePath = <K extends keyof paths>(p: K) => caseApi.resolvePath(p);

export function useMutationCaseUpdate({
  orcabusId,
  reactQuery,
}: {
  orcabusId: string;
  reactQuery?: {
    onSuccess?: (data: components['schemas']['CaseDetail']) => void;
    onError?: (error: Error) => void;
  };
}) {
  return useMutation({
    ...reactQuery,
    mutationFn: async (body: components['schemas']['PatchedCaseDetailRequest']) => {
      const c = getClient();
      const { data, error, response } = await (
        c.PATCH as (url: string, init?: object) => ReturnType<typeof c.PATCH>
      )(resolvePath(caseDetailPath), { params: { path: { orcabusId } }, body });
      return assertOk(data, error, response) as components['schemas']['CaseDetail'];
    },
  });
}

export function useMutationCaseCreate({
  reactQuery,
}: {
  reactQuery?: {
    onSuccess?: (data: components['schemas']['CaseDetail']) => void;
    onError?: (error: Error) => void;
  };
}) {
  return useMutation({
    ...reactQuery,
    mutationFn: async (body: components['schemas']['CaseDetailRequest']) => {
      const c = getClient();
      const { data, error, response } = await (
        c.POST as (url: string, init?: object) => ReturnType<typeof c.POST>
      )(resolvePath(casePath), { body });
      return assertOk(data, error, response) as components['schemas']['CaseDetail'];
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
  reactQuery?: { onSuccess?: () => void; onError?: (error: Error) => void };
}) {
  return useMutation({
    ...reactQuery,
    mutationFn: async () => {
      const c = getClient();
      const { data, error, response } = await (
        c.DELETE as (url: string, init?: object) => ReturnType<typeof c.DELETE>
      )(resolvePath(caseExternalEntityPath as keyof paths), {
        params: { path: { orcabusId: caseOrcabusId, externalEntityOrcabusId } },
      });
      return assertOk(data, error, response);
    },
  });
}

export function useMutationCaseLinkEntity({
  reactQuery,
}: {
  reactQuery?: { onSuccess?: () => void; onError?: (error: Error) => void };
}) {
  return useMutation({
    ...reactQuery,
    mutationFn: async (body: components['schemas']['CaseExternalEntityLinkCreateRequest']) => {
      const c = getClient();
      const { data, error, response } = await (
        c.POST as (url: string, init?: object) => ReturnType<typeof c.POST>
      )(resolvePath(caseLinkPath as keyof paths), { body });
      return assertOk(data, error, response);
    },
  });
}

export function useMutationCaseStateCreate({
  reactQuery,
}: {
  reactQuery?: { onSuccess?: () => void; onError?: (error: Error) => void };
}) {
  return useMutation({
    ...reactQuery,
    mutationFn: async (body: components['schemas']['StateRequest']) => {
      const c = getClient();
      const { data, error, response } = await (
        c.POST as (url: string, init?: object) => ReturnType<typeof c.POST>
      )(resolvePath(caseCreateStatePath as keyof paths), { body });
      return assertOk(data, error, response);
    },
  });
}
