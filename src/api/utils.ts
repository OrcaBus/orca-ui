import { fetchAuthSession } from 'aws-amplify/auth';
import { ParamsOption, RequestBodyOption, Middleware } from 'openapi-fetch';

export const authMiddleware: Middleware = {
  async onRequest({ request }) {
    const accessToken = (await fetchAuthSession()).tokens?.idToken?.toString();
    request.headers.set('Authorization', `Bearer ${accessToken}`);
    return request;
  },
};

export type PathsWithGet<Paths> = {
  [K in keyof Paths]: Paths[K] extends { get: unknown } ? K : never;
}[keyof Paths];

export type UseQueryOptions<T> = RequestBodyOption<T> & {
  // add your custom options here
  reactQuery?: {
    // Note: React Query type’s inference is difficult to apply automatically, hence manual option passing here
    // add other React Query options as needed
    enabled?: boolean; //  disable a query from automatically running, eg: enabled: !!filter,

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    placeholderData?: any; // placeholderData is not in the OpenAPI schema, eg: "keepPreviousData" form import { keepPreviousData } from '@tanstack/react-query'
  };
  // Some of query attribute (e.g. django query style, file-manager attribute linking) is not in the OpenAPI schema
  params: Omit<ParamsOption<T>['params'], 'query'> & {
    query?: Record<string, unknown>;
  };
  headers?: Record<string, string>;
};

export type UseSuspenseQueryOptions<T> = RequestBodyOption<T> & {
  // add your custom options here
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  reactQuery?: {
    // Note: React Query type’s inference is difficult to apply automatically, hence manual option passing here
    // add other React Query options as needed
  };
  // Some of query attribute (e.g. django query style, file-manager attribute linking) is not in the OpenAPI schema
  params: Omit<ParamsOption<T>['params'], 'query'> & {
    query?: Record<string, unknown>;
  };
  headers?: Record<string, string>;
};

export type ConditionalUseSuspenseQueryOptions<T> = UseSuspenseQueryOptions<T> & {
  // UseSuspenseQuery does not support enabled, should be okay to return null from the query instead:
  // https://github.com/TanStack/query/discussions/6206
  enabled: boolean;
};

// Extend the UseMutationOptions type
export type UseMutationOptions<T> = {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  reactQuery?: {
    // Note: React Query type’s inference is difficult to apply automatically, hence manual option passing here
    // add other React Query options as needed
  };
  params?: Omit<ParamsOption<T>['params'], 'query'> & {
    query?: Record<string, unknown>;
  };
  headers?: Record<string, string>;
  body?: Record<string, unknown>;
};
