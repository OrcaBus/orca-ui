import config from '@/config';
import type { components, paths } from './types/sequence-run';
import {
  ApiClient,
  getVersionedPath,
  createQueryHook,
  createPostMutationHook,
  createPatchMutationHook,
  createDeleteMutationHook,
} from './utils';
import { env } from '@/utils/commonUtils';

const apiVersion = env.VITE_SEQUENCE_RUN_API_VERSION;

const sequenceRunApi = new ApiClient<paths>({
  baseUrl: config.apiEndpoint.sequenceRun,
  getPath: (path) => getVersionedPath(path, apiVersion),
});

// export component types for consumers
export type SequenceRunModel = components['schemas']['SequenceRun'];

// sequence run list
export const useSequenceRunListModel = createQueryHook(sequenceRunApi, '/api/v1/sequence_run/');
export const useSequenceRunListByInstrumentRunIdModel = createQueryHook(
  sequenceRunApi,
  '/api/v1/sequence_run/list_by_instrument_run_id/'
);

// sequence run detail
export const useSequenceRunDetailModel = createQueryHook(
  sequenceRunApi,
  '/api/v1/sequence_run/{orcabusId}/'
);

// sequence run state
export const useSequenceRunStateListModel = createQueryHook(
  sequenceRunApi,
  '/api/v1/sequence_run/{orcabusId}/state/'
);
export const useSequenceRunStateCreateModel = createPostMutationHook(
  sequenceRunApi,
  '/api/v1/sequence_run/{orcabusId}/state/'
);
export const useSequenceRunStateUpdateModel = createPatchMutationHook(
  sequenceRunApi,
  '/api/v1/sequence_run/{orcabusId}/state/{id}/'
);

// sequence run comment
export const useSequenceRunCommentListModel = createQueryHook(
  sequenceRunApi,
  '/api/v1/sequence_run/{orcabusId}/comment/'
);
export const useSequenceRunCommentCreateModel = createPostMutationHook(
  sequenceRunApi,
  '/api/v1/sequence_run/{orcabusId}/comment/'
);
export const useSequenceRunCommentUpdateModel = createPatchMutationHook(
  sequenceRunApi,
  '/api/v1/sequence_run/{orcabusId}/comment/{id}/'
);
export const useSequenceRunCommentDeleteModel = createDeleteMutationHook(
  sequenceRunApi,
  '/api/v1/sequence_run/{orcabusId}/comment/{id}/'
);

// status count
export const useSequenceRunStatusCountModel = createQueryHook(
  sequenceRunApi,
  '/api/v1/stats/instrument_run_status_counts/'
);

// sample sheet
export const useSequenceRunSampleSheetModel = createQueryHook(
  sequenceRunApi,
  '/api/v1/sequence_run/{orcabusId}/sample_sheet/'
);
export const useSequenceRunAddSampleSheetModel = createPostMutationHook(
  sequenceRunApi,
  '/api/v1/sequence_run/action/add_samplesheet/'
);

// sequence - sequence runs, comments, states, samplesheet (group by instrument run id)
export const useSequenceRunByInstrumentRunIdModel = createQueryHook(
  sequenceRunApi,
  '/api/v1/sequence/{instrumentRunId}/sequence_run/'
);
export const useSequenceRunCommentsByInstrumentRunIdModel = createQueryHook(
  sequenceRunApi,
  '/api/v1/sequence/{instrumentRunId}/comments/'
);
export const useSequenceRunStatesByInstrumentRunIdModel = createQueryHook(
  sequenceRunApi,
  '/api/v1/sequence/{instrumentRunId}/states/'
);
export const useSequenceRunSampleSheetsByInstrumentRunIdModel = createQueryHook(
  sequenceRunApi,
  '/api/v1/sequence/{instrumentRunId}/sample_sheets/'
);
export const useSequenceRunStateValidMapModel = createQueryHook(
  sequenceRunApi,
  '/api/v1/sequence/{instrumentRunId}/get_states_transition_validation_map/'
);
