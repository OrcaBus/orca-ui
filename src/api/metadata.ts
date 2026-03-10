import config from '@/config';
import type { paths, components, operations } from './types/metadata';
import { ApiClient, createQueryHook, createPostMutationHook } from './utils';

const metadataApi = new ApiClient<paths>({
  baseUrl: config.apiEndpoint.metadata,
});

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

export const useQueryMetadataSubjectModel = createQueryHook(metadataApi, '/api/v1/subject/');
export const useQueryMetadataLibraryModel = createQueryHook(metadataApi, '/api/v1/library/');
export const useQueryMetadataDetailLibraryModel = createQueryHook(
  metadataApi,
  '/api/v1/library/{orcabusId}/'
);
export const useQueryMetadataDetailLibraryHistoryModel = createQueryHook(
  metadataApi,
  '/api/v1/library/{orcabusId}/history/'
);
export const useQueryMetadataIndividualModel = createQueryHook(metadataApi, '/api/v1/individual/');
export const useQueryMetadataSampleModel = createQueryHook(metadataApi, '/api/v1/sample/');
export const useQueryMetadataContactModel = createQueryHook(metadataApi, '/api/v1/contact/');
export const useQueryMetadataProjectModel = createQueryHook(metadataApi, '/api/v1/project/');

export const useMutationSyncGsheet = createPostMutationHook(metadataApi, '/api/v1/sync/gsheet/');
export const useMutationSyncCustomCsv = createPostMutationHook(
  metadataApi,
  '/api/v1/sync/presigned-csv/'
);
export const useMutationPreviewGsheetRecords = createPostMutationHook(
  metadataApi,
  '/api/v1/sync/preview-gsheet/'
);
