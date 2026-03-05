import config from '@/config';
import type { paths } from './types/file';
import {
  ApiClient,
  createQueryHook,
  createSuspenseQueryHook,
  createConditionalSuspenseQueryHook,
} from './utils';

const fileApi = new ApiClient<paths>({
  baseUrl: config.apiEndpoint.file,
});

const s3Path = '/api/v1/s3';
export type S3Record =
  paths[typeof s3Path]['get']['responses']['200']['content']['application/json']['results'][number];

const s3PresignObjIdPath = '/api/v1/s3/presign/{id}';
const s3PresignIdListPath = '/api/v1/s3/presign';

export const useQueryFileObject = createQueryHook(fileApi, s3Path);

export const usePresignedFileObjectId = createConditionalSuspenseQueryHook(
  fileApi,
  s3PresignObjIdPath
);

export const useQueryPresignedFileObjectId = createQueryHook(fileApi, s3PresignObjIdPath);

export const usePresignedFileList = createSuspenseQueryHook(fileApi, s3PresignIdListPath);

export const useQueryPresignedFileList = createQueryHook(fileApi, s3PresignIdListPath);
