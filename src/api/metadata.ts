import config from '@/config';
import createClient from 'openapi-fetch';
import type { paths, components, operations } from './types/metadata';
import { useMutation, useQuery } from '@tanstack/react-query';
import { authMiddleware, UseQueryOptions, UseMutationOptions, PathsWithGet } from './utils';

const client = createClient<paths>({ baseUrl: config.apiEndpoint.metadata });
client.use(authMiddleware);

type GetPaths = PathsWithGet<paths>;

function createMetadataUseQueryHook<K extends GetPaths>(path: K) {
  return function ({ params, reactQuery }: UseQueryOptions<paths[K]['get']>) {
    return useQuery({
      ...reactQuery,
      queryKey: [path, params],
      queryFn: async ({ signal }) => {
        const { data, error, response } =
          // @ts-expect-error: params is dynamic type type for openapi-fetch
          await client.GET(path, { params, signal });

        if (error) {
          if (typeof error === 'object') {
            throw new Error(JSON.stringify(error));
          }
          throw new Error(response.statusText);
        }

        return data;
      },
    });
  };
}

export function createMetadataPostHook<K extends keyof paths>(path: K) {
  return function ({ params, reactQuery, body }: UseMutationOptions<paths[typeof path]['post']>) {
    return useMutation({
      ...reactQuery,
      mutationFn: async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error, response }: { data?: any; error?: undefined; response: Response } =
          // @ts-expect-error: params is dynamic type type for openapi-fetch
          await client.POST(path, { params, body: body });
        if (error) {
          if (typeof error === 'object') {
            throw new Error(JSON.stringify(error));
          }
          throw new Error(response.statusText);
        }

        return data;
      },
    });
  };
}

export type PhenotypeEnum = components['schemas']['PhenotypeEnum'];
export type QualityEnum = components['schemas']['QualityEnum'];
export type TypeEnum = components['schemas']['TypeEnum'];
export type WorkflowEnum = components['schemas']['WorkflowEnum'];

export type LibraryListQueryParams = operations['libraryList']['parameters']['query'];
export type SubjectListQueryParams = operations['subjectList']['parameters']['query'];
export type IndividualListQueryParams = operations['individualList']['parameters']['query'];
export type SampleListQueryParams = operations['sampleList']['parameters']['query'];
export type ContactListQueryParams = operations['contactList']['parameters']['query'];
export type ProjectListQueryParams = operations['projectList']['parameters']['query'];

export const useQueryMetadataSubjectModel = createMetadataUseQueryHook('/api/v1/subject/');
export const useQueryMetadataLibraryModel = createMetadataUseQueryHook('/api/v1/library/');
export const useQueryMetadataDetailLibraryModel = createMetadataUseQueryHook(
  '/api/v1/library/{orcabusId}/'
);
export const useQueryMetadataDetailLibraryHistoryModel = createMetadataUseQueryHook(
  '/api/v1/library/{orcabusId}/history/'
);
export const useQueryMetadataIndividualModel = createMetadataUseQueryHook('/api/v1/individual/');
export const useQueryMetadataSampleModel = createMetadataUseQueryHook('/api/v1/sample/');
export const useQueryMetadataContactModel = createMetadataUseQueryHook('/api/v1/contact/');
export const useQueryMetadataProjectModel = createMetadataUseQueryHook('/api/v1/project/');

// UseMutation
export const useMutationSyncGsheet = createMetadataPostHook('/api/v1/sync/gsheet/');
export const useMutationSyncCustomCsv = createMetadataPostHook('/api/v1/sync/presigned-csv/');
export const useMutationPreviewGsheetRecords = createMetadataPostHook(
  '/api/v1/sync/preview-gsheet/'
);
