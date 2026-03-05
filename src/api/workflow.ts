import config from '@/config';
import type { paths, components } from './types/workflow';
import {
  ApiClient,
  getVersionedPath,
  createQueryHook,
  createSuspenseQueryHook,
  createPostMutationHook,
  createPatchMutationHook,
  type PathsWithPatch,
} from './utils';
import { env } from '@/utils/commonUtils';

const apiVersion = env.VITE_WORKFLOW_API_VERSION;

const workflowApi = new ApiClient<paths>({
  baseUrl: config.apiEndpoint.workflow,
  getPath: (path) => getVersionedPath(path, apiVersion),
});

export const useWorkflowModel = createQueryHook(workflowApi, '/api/v1/workflow/');
export const useWorkflowDetailModel = createQueryHook(workflowApi, '/api/v1/workflow/{orcabusId}/');
export const useWorkflowGroupedModel = createQueryHook(workflowApi, '/api/v1/workflow/grouped/');

// workflow run
export const useWorkflowRunListModel = createQueryHook(workflowApi, '/api/v1/workflowrun/');
export const useWorkflowRunDetailModel = createQueryHook(
  workflowApi,
  '/api/v1/workflowrun/{orcabusId}/'
);
// Schema marks this path as get-only; backend may support PATCH - assert for hook compatibility
export const useWorkflowRunDetailUpdateModel = createPatchMutationHook(
  workflowApi,
  '/api/v1/workflowrun/{orcabusId}/' as PathsWithPatch<paths>
);
export const useWorkflowStateModel = createQueryHook(
  workflowApi,
  '/api/v1/workflowrun/{orcabusId}/state/'
);

// payload
export const useWorkflowPayloadModel = createQueryHook(workflowApi, '/api/v1/payload/{orcabusId}/');

// workflow run comment
export const useWorkflowRunCommentModel = createQueryHook(
  workflowApi,
  '/api/v1/workflowrun/{orcabusId}/comment/'
);
export const useWorkflowRunCommentCreateModel = createPostMutationHook(
  workflowApi,
  '/api/v1/workflowrun/{orcabusId}/comment/'
);
export const useWorkflowRunCommentUpdateModel = createPatchMutationHook(
  workflowApi,
  '/api/v1/workflowrun/{orcabusId}/comment/{commentOrcabusId}/'
);
export const useWorkflowRunCommentDeleteModel = createPostMutationHook(
  workflowApi,
  '/api/v1/workflowrun/{orcabusId}/comment/{commentOrcabusId}/soft_delete/'
);

// workflow run state creation
export const useWorkflowRunStateCreateModel = createPostMutationHook(
  workflowApi,
  '/api/v1/workflowrun/{orcabusId}/state/'
);
export const useWorkflowRunStateUpdateModel = createPatchMutationHook(
  workflowApi,
  '/api/v1/workflowrun/{orcabusId}/state/{id}/'
);
export const useWorkflowRunStateCreationValidMapModel = createQueryHook(
  workflowApi,
  '/api/v1/workflowrun/{orcabusId}/state/get_states_transition_validation_map/'
);

// Use suspenseQuery hook for fetching data
export const useSuspenseWorkflowRunListModel = createSuspenseQueryHook(
  workflowApi,
  '/api/v1/workflowrun/'
);
export const useSuspenseWorkflowModel = createSuspenseQueryHook(workflowApi, '/api/v1/workflow/');
export const useSuspensePayloadListModel = createSuspenseQueryHook(workflowApi, '/api/v1/payload/');

// analysis run
export const useAnalysisRunListModel = createQueryHook(workflowApi, '/api/v1/analysisrun/');
export const useAnalysisRunDetailModel = createQueryHook(
  workflowApi,
  '/api/v1/analysisrun/{orcabusId}/'
);

// analysis run comment
export const useAnalysisRunCommentListModel = createQueryHook(
  workflowApi,
  '/api/v1/analysisrun/{orcabusId}/comment/'
);
export const useAnalysisRunCommentCreateModel = createPostMutationHook(
  workflowApi,
  '/api/v1/analysisrun/{orcabusId}/comment/'
);
export const useAnalysisRunCommentUpdateModel = createPatchMutationHook(
  workflowApi,
  '/api/v1/analysisrun/{orcabusId}/comment/{commentOrcabusId}/'
);
export const useAnalysisRunCommentDeleteModel = createPostMutationHook(
  workflowApi,
  '/api/v1/analysisrun/{orcabusId}/comment/{commentOrcabusId}/soft_delete/'
);

// analysis
export const useAnalysisListModel = createQueryHook(workflowApi, '/api/v1/analysis/');
export const useAnalysisCreateModel = createPostMutationHook(workflowApi, '/api/v1/analysis/');
export const useAnalysisDetailModel = createQueryHook(workflowApi, '/api/v1/analysis/{orcabusId}/');
export const useAnalysisDetailUpdateModel = createPatchMutationHook(
  workflowApi,
  '/api/v1/analysis/{orcabusId}/'
);

// analysis context
export const useAnalysisContextListModel = createQueryHook(workflowApi, '/api/v1/analysiscontext/');
export const useAnalysisContextCreateModel = createPostMutationHook(
  workflowApi,
  '/api/v1/analysiscontext/'
);
export const useAnalysisContextDetailModel = createQueryHook(
  workflowApi,
  '/api/v1/analysiscontext/{orcabusId}/'
);
export const useAnalysisContextDetailUpdateModel = createPatchMutationHook(
  workflowApi,
  '/api/v1/analysiscontext/{orcabusId}/'
);

// library
export const useLibraryListModel = createQueryHook(workflowApi, '/api/v1/library/');
export const useLibraryDetailModel = createQueryHook(workflowApi, '/api/v1/library/{orcabusId}/');

// run context
export const useRunContextListModel = createQueryHook(workflowApi, '/api/v1/runcontext/');
export const useRunContextCreateModel = createPostMutationHook(workflowApi, '/api/v1/runcontext/');
export const useRunContextDetailModel = createQueryHook(
  workflowApi,
  '/api/v1/runcontext/{orcabusId}/'
);
export const useRunContextDetailUpdateModel = createPatchMutationHook(
  workflowApi,
  '/api/v1/runcontext/{orcabusId}/'
);

// rerun
export const useWorkflowRunRerunModel = createPostMutationHook(
  workflowApi,
  '/api/v1/workflowrun/{orcabusId}/rerun/'
);
export const useWorkflowRunRerunValidateModel = createQueryHook(
  workflowApi,
  '/api/v1/workflowrun/{orcabusId}/validate_rerun_workflows/'
);

// statistics
export const useWorkflowRunStatusCountModel = createQueryHook(
  workflowApi,
  '/api/v1/workflowrun/stats/count_by_status/'
);

// Re-export component types for consumers
export type WorkflowModel = components['schemas']['Workflow'];
export type WorkflowListModel = components['schemas']['WorkflowList'];
export type WorkflowRunModel = components['schemas']['WorkflowRunDetail'];
export type AnalysisRunModel = components['schemas']['AnalysisRunDetail'];
export type AnalysisModel = components['schemas']['Analysis'];
export type ComputeContextModel = components['schemas']['AnalysisContext'];
export type StorageContextModel = components['schemas']['AnalysisContext'];
export type WorkflowRunPaginatedModel = components['schemas']['PaginatedWorkflowRunList'];
export type WorkflowRunRerunValidMapDataModel = components['schemas']['AllowedRerunWorkflow'];
