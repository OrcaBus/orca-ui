import { fetchAuthSession } from 'aws-amplify/auth';
import createClient from 'openapi-fetch';
import type { ParamsOption, RequestBodyOption, Middleware } from 'openapi-fetch';
import { useSuspenseQuery, useQuery, useMutation } from '@tanstack/react-query';

/** OpenAPI paths type from codegen (e.g. paths from ./types/workflow). Use object so interface types are accepted. */
export type PathsRecord = object;

/** Path type helpers (paths that have get/post/patch/delete) */
export type PathsWithGet<Paths> = {
  [K in keyof Paths]: Paths[K] extends { get: unknown } ? K : never;
}[keyof Paths];

export type PathsWithPost<Paths> = {
  [K in keyof Paths]: Paths[K] extends { post: unknown } ? K : never;
}[keyof Paths];

export type PathsWithPatch<Paths> = {
  [K in keyof Paths]: Paths[K] extends { patch: unknown } ? K : never;
}[keyof Paths];

export type PathsWithDelete<Paths> = {
  [K in keyof Paths]: Paths[K] extends { delete: unknown } ? K : never;
}[keyof Paths];

/** Operation type for a path key (safe when Paths extends object) */
type PathGetOp<Paths, K> = K extends keyof Paths
  ? Paths[K] extends { get: infer G }
    ? G
    : never
  : never;
type PathPostOp<Paths, K> = K extends keyof Paths
  ? Paths[K] extends { post: infer G }
    ? G
    : never
  : never;
type PathPatchOp<Paths, K> = K extends keyof Paths
  ? Paths[K] extends { patch: infer G }
    ? G
    : never
  : never;
type PathDeleteOp<Paths, K> = K extends keyof Paths
  ? Paths[K] extends { delete: infer G }
    ? G
    : never
  : never;

/** Unified error handling: throw on error, return data on success */
export function assertOk<T>(data: T | undefined, error: unknown, response: Response): T {
  if (error) {
    if (typeof error === 'object') {
      throw new Error(JSON.stringify(error));
    }
    throw new Error(response.statusText);
  }
  return data as T;
}

/**
 * Build a versioned path (e.g. /api/v1/... -> /api/v2/...) for common usage across workflow, sequenceRun, etc.
 * @param path - OpenAPI path string (e.g. '/api/v1/workflow/')
 * @param apiVersion - Optional version segment (e.g. 'v2'). If falsy, returns path unchanged.
 */
export function getVersionedPath<K extends string>(path: K, apiVersion?: string): K {
  if (!apiVersion) return path;
  return path.replace('/api/v1/', `/api/${apiVersion}/`) as K;
}

export const authMiddleware: Middleware = {
  async onRequest({ request }) {
    const accessToken = (await fetchAuthSession()).tokens?.idToken?.toString();
    request.headers.set('Authorization', `Bearer ${accessToken}`);
    return request;
  },
};

/**
 * Unified API client over OpenAPI paths. Holds the openapi-fetch client and optional path transform.
 * Hook factories use getClient() + resolvePath() and assertOk for requests (no get/post/patch/delete on the class).
 */
export class ApiClient<Paths extends PathsRecord> {
  private client: ReturnType<typeof createClient<Paths>>;
  private pathTransform: <K extends keyof Paths>(path: K) => K;

  constructor(config: {
    baseUrl: string;
    /** Optional path transformer (e.g. for API versioning). Defaults to identity. */
    getPath?: <K extends keyof Paths>(path: K) => K;
  }) {
    this.client = createClient<Paths>({ baseUrl: config.baseUrl });
    this.client.use(authMiddleware);
    this.pathTransform = (config.getPath ?? ((p) => p)) as <K extends keyof Paths>(path: K) => K;
  }

  /** Resolved path used for requests (use in queryKey for cache consistency). */
  resolvePath<K extends keyof Paths>(path: K): K {
    return this.pathTransform(path);
  }

  /** Raw client for hook factories to call GET/POST/PATCH/DELETE and apply assertOk + signal. */
  getClient(): ReturnType<typeof createClient<Paths>> {
    return this.client;
  }
}

// --- Option types for hooks ---

export type UseQueryOptions<T> = RequestBodyOption<T> & {
  reactQuery?: {
    enabled?: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    placeholderData?: any;
  };
  params: Omit<ParamsOption<T>['params'], 'query'> & {
    query?: Record<string, unknown>;
  };
  headers?: Record<string, string>;
};

export type UseSuspenseQueryOptions<T> = RequestBodyOption<T> & {
  reactQuery?: Record<string, unknown>;
  params: Omit<ParamsOption<T>['params'], 'query'> & {
    query?: Record<string, unknown>;
  };
  headers?: Record<string, string>;
};

export type ConditionalUseSuspenseQueryOptions<T> = UseSuspenseQueryOptions<T> & {
  enabled: boolean;
};

export type UseMutationOptions<T> = {
  reactQuery?: Record<string, unknown>;
  params?: Omit<ParamsOption<T>['params'], 'query'> & {
    query?: Record<string, unknown>;
  };
  headers?: Record<string, string>;
  body?: Record<string, unknown> | FormData;
};

// --- Hook factories: use ApiClient + path; call client GET/POST/etc. and assertOk with signal ---

type GetResponseType<GetOp> = GetOp extends {
  responses: { 200: { content: { 'application/json': infer T } } };
}
  ? T
  : never;

export function createQueryHook<Paths extends PathsRecord, Path extends PathsWithGet<Paths>>(
  api: ApiClient<Paths>,
  path: Path
) {
  type GetOp = PathGetOp<Paths, Path>;
  type R = GetResponseType<GetOp>;
  const resolvedPath = api.resolvePath(path);
  const client = api.getClient();

  return function (
    options: Omit<UseQueryOptions<GetOp>, 'queryKey' | 'queryFn'> & { signal?: AbortSignal }
  ) {
    return useQuery<R, Error, R, [Path, typeof options.params]>({
      ...options.reactQuery,
      queryKey: [resolvedPath, options.params],
      queryFn: async ({ signal }) => {
        const usedSignal = options.signal ?? signal;
        const { data, error, response } = await (
          client.GET as (url: keyof Paths, init?: object) => ReturnType<typeof client.GET>
        )(resolvedPath as keyof Paths, {
          params: options.params,
          signal: usedSignal,
          headers: options.headers,
        });
        return assertOk(data, error, response) as R;
      },
    });
  };
}

export function createSuspenseQueryHook<
  Paths extends PathsRecord,
  Path extends PathsWithGet<Paths>,
>(api: ApiClient<Paths>, path: Path) {
  type GetOp = PathGetOp<Paths, Path>;
  type R = GetResponseType<GetOp>;
  const resolvedPath = api.resolvePath(path);
  const client = api.getClient();

  return function (
    options: Omit<UseSuspenseQueryOptions<GetOp>, 'queryKey' | 'queryFn'> & {
      signal?: AbortSignal;
    }
  ) {
    return useSuspenseQuery<R, Error, R, [Path, typeof options.params]>({
      ...options.reactQuery,
      queryKey: [resolvedPath, options.params],
      queryFn: async ({ signal }) => {
        const usedSignal = options.signal ?? signal;
        const { data, error, response } = await (
          client.GET as (url: keyof Paths, init?: object) => ReturnType<typeof client.GET>
        )(resolvedPath as keyof Paths, {
          params: options.params,
          signal: usedSignal,
          headers: options.headers,
        });
        return assertOk(data, error, response) as R;
      },
    });
  };
}

/** Suspense query hook that supports enabled: when false, queryFn returns null without fetching. */
export function createConditionalSuspenseQueryHook<
  Paths extends PathsRecord,
  Path extends PathsWithGet<Paths>,
>(api: ApiClient<Paths>, path: Path) {
  type GetOp = PathGetOp<Paths, Path>;
  type R = GetResponseType<GetOp>;
  const resolvedPath = api.resolvePath(path);
  const client = api.getClient();

  return function (
    options: Omit<ConditionalUseSuspenseQueryOptions<GetOp>, 'queryKey' | 'queryFn'> & {
      signal?: AbortSignal;
    }
  ) {
    return useSuspenseQuery<R | null, Error, R | null, [Path, typeof options.params]>({
      ...options.reactQuery,
      queryKey: [resolvedPath, options.params],
      queryFn: async ({ signal }) => {
        if (!options.enabled) return null;
        const usedSignal = options.signal ?? signal;
        const { data, error, response } = await (
          client.GET as (url: keyof Paths, init?: object) => ReturnType<typeof client.GET>
        )(resolvedPath as keyof Paths, {
          params: options.params,
          signal: usedSignal,
          headers: options.headers,
        });
        return assertOk(data, error, response) as R;
      },
    });
  };
}

export function createPostMutationHook<
  Paths extends PathsRecord,
  Path extends PathsWithPost<Paths>,
>(api: ApiClient<Paths>, path: Path) {
  const resolvedPath = api.resolvePath(path);
  const client = api.getClient();

  return function (options: UseMutationOptions<PathPostOp<Paths, Path>>) {
    const { params, body, reactQuery, headers } = options;
    return useMutation({
      ...reactQuery,
      mutationFn: async () => {
        const { data, error, response } = await (
          client.POST as (url: keyof Paths, init?: object) => ReturnType<typeof client.POST>
        )(resolvedPath as keyof Paths, {
          params,
          body,
          headers,
        });
        return assertOk(data, error, response);
      },
    });
  };
}

export function createPatchMutationHook<
  Paths extends PathsRecord,
  Path extends PathsWithPatch<Paths>,
>(api: ApiClient<Paths>, path: Path) {
  const resolvedPath = api.resolvePath(path);
  const client = api.getClient();

  return function (options: UseMutationOptions<PathPatchOp<Paths, Path>>) {
    const { params, body, reactQuery, headers } = options;
    return useMutation({
      ...reactQuery,
      mutationFn: async () => {
        const { data, error, response } = await (
          client.PATCH as (url: keyof Paths, init?: object) => ReturnType<typeof client.PATCH>
        )(resolvedPath as keyof Paths, {
          params,
          body,
          headers,
        });
        return assertOk(data, error, response);
      },
    });
  };
}

export function createDeleteMutationHook<
  Paths extends PathsRecord,
  Path extends PathsWithDelete<Paths>,
>(api: ApiClient<Paths>, path: Path) {
  const resolvedPath = api.resolvePath(path);
  const client = api.getClient();

  return function (options: UseMutationOptions<PathDeleteOp<Paths, Path>>) {
    const { params, body, reactQuery, headers } = options;
    return useMutation({
      ...reactQuery,
      mutationFn: async () => {
        const { data, error, response } = await (
          client.DELETE as (url: keyof Paths, init?: object) => ReturnType<typeof client.DELETE>
        )(resolvedPath as keyof Paths, {
          params,
          body,
          headers,
        });
        return assertOk(data, error, response);
      },
    });
  };
}
