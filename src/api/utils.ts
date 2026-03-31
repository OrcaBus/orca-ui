import { fetchAuthSession } from 'aws-amplify/auth';
import createFetchClient, {
  type Middleware,
  type FetchResponse,
  type MaybeOptionalInit,
} from 'openapi-fetch';
import createClient from 'openapi-react-query';
import type {
  QueryClient,
  UseQueryOptions,
  UseQueryResult,
  UseSuspenseQueryOptions,
  UseSuspenseQueryResult,
  UseMutationOptions,
  UseMutationResult,
} from '@tanstack/react-query';

/* ---------------------------------- */
/* Base types                         */
/* ---------------------------------- */

// Matches the `Paths extends {}` constraint used by openapi-fetch / openapi-react-query.
// `Record<string, …>` would require an index signature that codegen'd `interface paths` lacks.
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type PathsRecord = {};

type PathsWithMethod<
  Paths extends PathsRecord,
  Method extends 'get' | 'post' | 'patch' | 'delete',
> = {
  [K in keyof Paths]: Paths[K] extends Record<Method, unknown> ? K : never;
}[keyof Paths] &
  string;

export type PathsWithGet<Paths extends PathsRecord> = PathsWithMethod<Paths, 'get'>;
export type PathsWithPost<Paths extends PathsRecord> = PathsWithMethod<Paths, 'post'>;
export type PathsWithPatch<Paths extends PathsRecord> = PathsWithMethod<Paths, 'patch'>;
export type PathsWithDelete<Paths extends PathsRecord> = PathsWithMethod<Paths, 'delete'>;

/* ---------------------------------- */
/* Internal type helpers              */
/* ---------------------------------- */

type MediaType = `${string}/${string}`;

// Intersection ensures TS can prove the method key exists on the path item,
// even through the indirection of PathsWithMethod mapped types.
type Ensure<P, M extends string> = P & Record<M, Record<string | number, unknown>>;
type OpOf<P, M extends string> = Ensure<P, M>[M];
type InitOf<P, M extends string> = MaybeOptionalInit<Ensure<P, M>, M>;
type RespOf<P, M extends string> = Required<FetchResponse<OpOf<P, M>, InitOf<P, M>, MediaType>>;

// Allows extra query params (DRF filter lookups like `workflow__orcabus_id`)
// and extra top-level keys on the init object.
type LooseInit = Record<string, unknown> & { params?: { query?: Record<string, unknown> } };

// Common React Query options accepted by `reactQuery` on all hooks.
// TanStack's full option types are difficult to infer through the generic
// plumbing, so we surface the most-used options explicitly here and
// forward everything else via `Opts` (the inferred query/mutation options).
type ReactQueryExtras = {
  enabled?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  placeholderData?: any;
};

// Build the single-argument type for hooks:
//   { ...fetchInit, reactQuery?: TanStackOptions }
// Init is optional when the endpoint has no required params/body.
type HookArg<I, Opts> = undefined extends I
  ? (Exclude<I, undefined> & LooseInit & { reactQuery?: Opts & ReactQueryExtras }) | undefined
  : I & LooseInit & { reactQuery?: Opts & ReactQueryExtras };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFn = (...args: any[]) => any;

// Mutation result where variables are optional (pre-bound via baseInit at hook-call time).
type BoundMutationResult<D, E, V, C = unknown> = Omit<
  UseMutationResult<D, E, V, C>,
  'mutate' | 'mutateAsync'
> & {
  mutate: (variables?: V, options?: Parameters<UseMutationResult<D, E, V, C>['mutate']>[1]) => void;
  mutateAsync: (
    variables?: V,
    options?: Parameters<UseMutationResult<D, E, V, C>['mutateAsync']>[1]
  ) => Promise<D>;
};

/* ---------------------------------- */
/* Shared Cognito middleware          */
/* ---------------------------------- */

export const authMiddleware: Middleware = {
  async onRequest({ request }) {
    const idToken = (await fetchAuthSession()).tokens?.idToken?.toString();
    if (idToken) {
      request.headers.set('Authorization', `Bearer ${idToken}`);
    }
    return request;
  },
};

/* ---------------------------------- */
/* Utilities                          */
/* ---------------------------------- */

export function getVersionedPath<K extends string>(path: K, apiVersion?: string): K {
  if (!apiVersion) return path;
  return path.replace('/api/v1/', `/api/${apiVersion}/`) as K;
}

export function assertOk<T>(data: T | undefined, error: unknown, response: Response): T {
  if (error || !response.ok) {
    let toThrow: Error;

    if (error == null) {
      const statusText = response.statusText ? ` ${response.statusText}` : '';
      toThrow = new Error(`Request failed: ${response.status}${statusText}`);
    } else if (error instanceof Error) {
      toThrow = error;
    } else {
      let message: string;
      if (typeof error === 'string') {
        message = error;
      } else {
        try {
          message = JSON.stringify(error);
        } catch {
          message = String(error);
        }
      }
      toThrow = new Error(message);
    }

    throw toThrow;
  }
  return data as T;
}

/* ---------------------------------- */
/* Service client                     */
/* ---------------------------------- */

export class ApiClient<Paths extends PathsRecord> {
  readonly fetch: ReturnType<typeof createFetchClient<Paths>>;
  readonly rq: ReturnType<typeof createClient<Paths>>;
  private pathTransform: <K extends keyof Paths & string>(path: K) => K;

  constructor(config: {
    baseUrl: string;
    getPath?: <K extends keyof Paths & string>(path: K) => K;
  }) {
    this.fetch = createFetchClient<Paths>({ baseUrl: config.baseUrl });
    this.fetch.use(authMiddleware);
    this.rq = createClient(this.fetch);
    this.pathTransform = config.getPath ?? ((p) => p);
  }

  resolvePath<K extends keyof Paths & string>(path: K): K {
    return this.pathTransform(path);
  }

  getClient() {
    return this.fetch;
  }
}

/* ---------------------------------- */
/* Query hook factories               */
/* ---------------------------------- */

/**
 * Creates a typed `useQuery` hook pre-bound to a GET endpoint.
 *
 * Accepts a single argument `{ params, reactQuery? }` matching the
 * convention used across the codebase.  Extra query-param keys are
 * allowed for DRF filter lookups (`workflow__orcabus_id`, etc.).
 */
export function createQueryHook<
  Paths extends PathsRecord,
  Path extends PathsWithMethod<Paths, 'get'>,
>(api: ApiClient<Paths>, path: Path) {
  const resolved = api.resolvePath(path);

  type I = InitOf<Paths[Path], 'get'>;
  type R = RespOf<Paths[Path], 'get'>;
  type Opts = Omit<UseQueryOptions<R['data'], R['error']>, 'queryKey' | 'queryFn'>;

  return (arg?: HookArg<I, Opts>): UseQueryResult<R['data'], R['error']> => {
    if (!arg) return (api.rq.useQuery as AnyFn)('get', resolved);
    const { reactQuery, ...init } = arg as Record<string, unknown>;
    return (api.rq.useQuery as AnyFn)('get', resolved, init, reactQuery);
  };
}

export function createSuspenseQueryHook<
  Paths extends PathsRecord,
  Path extends PathsWithMethod<Paths, 'get'>,
>(api: ApiClient<Paths>, path: Path) {
  const resolved = api.resolvePath(path);

  type I = InitOf<Paths[Path], 'get'>;
  type R = RespOf<Paths[Path], 'get'>;
  type Opts = Omit<UseSuspenseQueryOptions<R['data'], R['error']>, 'queryKey' | 'queryFn'>;

  return (arg?: HookArg<I, Opts>): UseSuspenseQueryResult<R['data'], R['error']> => {
    if (!arg) return (api.rq.useSuspenseQuery as AnyFn)('get', resolved);
    const { reactQuery, ...init } = arg as Record<string, unknown>;
    return (api.rq.useSuspenseQuery as AnyFn)('get', resolved, init, reactQuery);
  };
}

/**
 * useQuery-based hook that supports top-level `enabled` for conditional fetching.
 *
 * Callers may pass `enabled` at the top level:
 *   useThing({ params, enabled: false })
 *
 * This will be translated into `reactQuery.enabled` and will **not** be forwarded
 * into the OpenAPI fetch init object.
 */
export function createConditionalSuspenseQueryHook<
  Paths extends PathsRecord,
  Path extends PathsWithMethod<Paths, 'get'>,
>(api: ApiClient<Paths>, path: Path) {
  const resolved = api.resolvePath(path);

  type I = InitOf<Paths[Path], 'get'>;
  type R = RespOf<Paths[Path], 'get'>;
  type Opts = Omit<UseQueryOptions<R['data'], R['error']>, 'queryKey' | 'queryFn'>;

  return (
    arg?: HookArg<I, Opts> & { enabled?: boolean },
  ): UseQueryResult<R['data'], R['error']> => {
    if (!arg) return (api.rq.useQuery as AnyFn)('get', resolved);

    const { reactQuery, enabled, ...init } = arg as Record<string, unknown>;
    const reactQueryWithEnabled =
      enabled === undefined
        ? (reactQuery as unknown)
        : { ...(reactQuery as Record<string, unknown> | undefined), enabled };

    return (api.rq.useQuery as AnyFn)('get', resolved, init, reactQueryWithEnabled);
  };
}

/* ---------------------------------- */
/* Query model factory                */
/* ---------------------------------- */

export function createQueryModel<
  Paths extends PathsRecord,
  Path extends PathsWithMethod<Paths, 'get'>,
>(api: ApiClient<Paths>, path: Path) {
  const resolved = api.resolvePath(path);

  type I = InitOf<Paths[Path], 'get'>;
  type InitArg = undefined extends I
    ? (Exclude<I, undefined> & LooseInit) | undefined
    : I & LooseInit;

  return {
    path: resolved,

    queryOptions(arg?: InitArg): ReturnType<typeof api.rq.queryOptions> {
      return (api.rq.queryOptions as AnyFn)('get', resolved, arg);
    },

    useQuery: createQueryHook(api, path),
    useSuspenseQuery: createSuspenseQueryHook(api, path),

    prefetch(queryClient: QueryClient, arg?: InitArg): Promise<void> {
      return queryClient.prefetchQuery((api.rq.queryOptions as AnyFn)('get', resolved, arg));
    },
  } satisfies {
    path: Path;
    queryOptions: AnyFn;
    useQuery: AnyFn;
    useSuspenseQuery: AnyFn;
    prefetch: AnyFn;
  };
}

/* ---------------------------------- */
/* Mutation hook factories            */
/* ---------------------------------- */

/**
 * Creates a typed `useMutation` hook pre-bound to a mutating endpoint.
 *
 * Accepts a single argument `{ params?, body?, reactQuery? }`.
 * If `params`/`body` are provided at hook-call time they become the
 * default variables for `mutate()` — callers can override by passing
 * new variables directly to `mutate(newInit)`.
 */
export function createMutationHook<
  Paths extends PathsRecord,
  Method extends 'post' | 'patch' | 'delete',
  Path extends PathsWithMethod<Paths, Method>,
>(api: ApiClient<Paths>, method: Method, path: Path) {
  const resolved = api.resolvePath(path);

  type I = InitOf<Paths[Path], Method>;
  type R = RespOf<Paths[Path], Method>;
  type MutOpts = Omit<UseMutationOptions<R['data'], R['error'], I>, 'mutationKey' | 'mutationFn'>;

  return (arg?: HookArg<I, MutOpts>): BoundMutationResult<R['data'], R['error'], I> => {
    const { reactQuery, ...baseInit } = (arg ?? {}) as Record<string, unknown>;
    const mutation = (api.rq.useMutation as AnyFn)(
      method,
      resolved,
      reactQuery
    ) as UseMutationResult<R['data'], R['error'], I>;

    const hasBaseInit = Object.keys(baseInit).length > 0;
    if (!hasBaseInit) return mutation as BoundMutationResult<R['data'], R['error'], I>;

    return {
      ...mutation,
      mutate: (runtimeInit?: I, opts?: Parameters<typeof mutation.mutate>[1]) =>
        mutation.mutate((runtimeInit ?? baseInit) as I, opts),
      mutateAsync: (runtimeInit?: I, opts?: Parameters<typeof mutation.mutateAsync>[1]) =>
        mutation.mutateAsync((runtimeInit ?? baseInit) as I, opts),
    };
  };
}

export const createPostMutationHook = <
  Paths extends PathsRecord,
  Path extends PathsWithMethod<Paths, 'post'>,
>(
  api: ApiClient<Paths>,
  path: Path
) => createMutationHook(api, 'post', path);

export const createPatchMutationHook = <
  Paths extends PathsRecord,
  Path extends PathsWithMethod<Paths, 'patch'>,
>(
  api: ApiClient<Paths>,
  path: Path
) => createMutationHook(api, 'patch', path);

export const createDeleteMutationHook = <
  Paths extends PathsRecord,
  Path extends PathsWithMethod<Paths, 'delete'>,
>(
  api: ApiClient<Paths>,
  path: Path
) => createMutationHook(api, 'delete', path);
