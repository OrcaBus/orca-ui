import config from '@/config';
import type { paths, components } from './types/file';
import { ApiClient, createQueryHook, createSuspenseQueryHook } from './utils';

const fileApi = new ApiClient<paths>({
  baseUrl: config.apiEndpoint.file,
});

export type S3Record = components['schemas']['ListResponse_S3']['results'][number];

export const useQueryFileObject = createQueryHook(fileApi, '/api/v1/s3');

export const usePresignedFileObjectId = createSuspenseQueryHook(fileApi, '/api/v1/s3/presign/{id}');

export const useQueryPresignedFileObjectId = createQueryHook(fileApi, '/api/v1/s3/presign/{id}');

export const usePresignedFileList = createSuspenseQueryHook(fileApi, '/api/v1/s3/presign');

export const useQueryPresignedFileList = createQueryHook(fileApi, '/api/v1/s3/presign');
