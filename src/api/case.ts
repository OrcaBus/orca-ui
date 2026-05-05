import config from '@/config';
import type { components, paths } from './types/case';
import { useMutation } from '@tanstack/react-query';
import { ApiClient, assertOk, createSuspenseQueryHook } from './utils';

const caseApi = new ApiClient<paths>({
  baseUrl: config.apiEndpoint.case,
});

export const casePath = '/api/v1/case/';
export const caseDetailPath = '/api/v1/case/{orcabusId}/';
export const caseActivityPath = '/api/v1/case/{orcabusId}/activity/' as const;
export const caseUserPath = '/api/v1/case/{orcabusId}/user/' as const;
export const caseUserDetailPath = '/api/v1/case/{orcabusId}/user/{userOrcabusId}/' as const;
export const caseStatesPath = '/api/v1/case/{orcabusId}/states/' as const;

const caseExternalEntityPath =
  '/api/v1/case/{orcabusId}/external-entity/{externalEntityOrcabusId}/' as const;
const caseLinkPath = '/api/v1/case/{orcabusId}/external-entity/' as const;
const caseCreateStatePath = '/api/v1/state/' as const;
const caseStateArchivePath = '/api/v1/state/{orcabusId}/archive/' as const;

export const useQueryCaseListObject = createSuspenseQueryHook(caseApi, casePath);
export const useQueryCaseDetailObject = createSuspenseQueryHook(caseApi, caseDetailPath);
export const useQueryCaseActivityObject = createSuspenseQueryHook(caseApi, caseActivityPath);
export const useQueryCaseStatesObject = createSuspenseQueryHook(caseApi, caseStatesPath);

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
  caseOrcabusId,
  reactQuery,
}: {
  caseOrcabusId: string;
  reactQuery?: { onSuccess?: () => void; onError?: (error: Error) => void };
}) {
  return useMutation({
    ...reactQuery,
    mutationFn: async (body: components['schemas']['CaseExternalEntityLinkCreateRequest']) => {
      const c = getClient();
      const { data, error, response } = await (
        c.POST as (url: string, init?: object) => ReturnType<typeof c.POST>
      )(resolvePath(caseLinkPath as keyof paths), {
        params: { path: { orcabusId: caseOrcabusId } },
        body,
      });
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
    mutationFn: async (body: components['schemas']['StateDetailRequest']) => {
      const c = getClient();
      const { data, error, response } = await (
        c.POST as (url: string, init?: object) => ReturnType<typeof c.POST>
      )(resolvePath(caseCreateStatePath as keyof paths), { body });
      return assertOk(data, error, response);
    },
  });
}

export function useMutationCaseUserCreate({
  caseOrcabusId,
  reactQuery,
}: {
  caseOrcabusId: string;
  reactQuery?: {
    onSuccess?: (data: components['schemas']['CaseUserCreate']) => void;
    onError?: (error: Error) => void;
  };
}) {
  return useMutation({
    ...reactQuery,
    mutationFn: async (body: components['schemas']['CaseUserCreateRequest']) => {
      const c = getClient();
      const { data, error, response } = await (
        c.POST as (url: string, init?: object) => ReturnType<typeof c.POST>
      )(resolvePath(caseUserPath as keyof paths), {
        params: { path: { orcabusId: caseOrcabusId } },
        body,
      });
      return assertOk(data, error, response) as components['schemas']['CaseUserCreate'];
    },
  });
}
export function useMutationCaseStateArchive({
  reactQuery,
}: {
  reactQuery?: { onSuccess?: () => void; onError?: (error: Error) => void };
}) {
  return useMutation({
    ...reactQuery,
    mutationFn: async (orcabusId: string) => {
      const c = getClient();
      const { data, error, response } = await (
        c.PATCH as (url: string, init?: object) => ReturnType<typeof c.PATCH>
      )(resolvePath(caseStateArchivePath as keyof paths), {
        params: { path: { orcabusId } },
      });
      return assertOk(data, error, response);
    },
  });
}
export function useMutationCaseUserDelete({
  caseOrcabusId,
  userOrcabusId,
  reactQuery,
}: {
  caseOrcabusId: string;
  userOrcabusId: string;
  reactQuery?: { onSuccess?: () => void; onError?: (error: Error) => void };
}) {
  return useMutation({
    ...reactQuery,
    mutationFn: async () => {
      const c = getClient();
      const { data, error, response } = await (
        c.DELETE as (url: string, init?: object) => ReturnType<typeof c.DELETE>
      )(resolvePath(caseUserDetailPath as keyof paths), {
        params: { path: { orcabusId: caseOrcabusId, userOrcabusId } },
      });
      return assertOk(data, error, response);
    },
  });
}

const commentPath = '/api/v1/comment/' as const;
const commentArchivePath = '/api/v1/comment/{orcabusId}/archive/' as const;

export const useQueryCommentList = createSuspenseQueryHook(caseApi, commentPath);

export function useMutationCommentCreate({
  reactQuery,
}: {
  reactQuery?: {
    onSuccess?: (data: components['schemas']['Comment']) => void;
    onError?: (error: Error) => void;
  };
}) {
  return useMutation({
    ...reactQuery,
    mutationFn: async (body: components['schemas']['CommentRequest']) => {
      const c = getClient();
      const { data, error, response } = await (
        c.POST as (url: string, init?: object) => ReturnType<typeof c.POST>
      )(resolvePath(commentPath as keyof paths), { body });
      return assertOk(data, error, response) as components['schemas']['Comment'];
    },
  });
}

export function useMutationCommentArchive({
  reactQuery,
}: {
  reactQuery?: { onSuccess?: () => void; onError?: (error: Error) => void };
}) {
  return useMutation({
    ...reactQuery,
    mutationFn: async (orcabusId: string) => {
      const c = getClient();
      const { data, error, response } = await (
        c.PATCH as (url: string, init?: object) => ReturnType<typeof c.PATCH>
      )(resolvePath(commentArchivePath as keyof paths), {
        params: { path: { orcabusId } },
      });
      return assertOk(data, error, response);
    },
  });
}
