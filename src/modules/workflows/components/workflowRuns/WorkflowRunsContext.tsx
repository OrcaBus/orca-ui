/* eslint-disable react-refresh/only-export-components */
// https://github.com/ArnaudBarre/eslint-plugin-react-refresh/issues/25#issuecomment-1729071347

import {
  createContext,
  FC,
  PropsWithChildren,
  ReactElement,
  useContext,
  useEffect,
  useState,
} from 'react';
import {
  useWorkflowRunCommentModel,
  useWorkflowRunDetailModel,
  useWorkflowStateModel,
  useWorkflowRunStateCreationValidMapModel,
  useWorkflowRunRerunValidateModel,
} from '@/api/workflow';
// import type { WorkflowRunModel } from '@/api/workflow';
import { useParams } from 'react-router-dom';
import { SpinnerWithText } from '@/components/common/spinner';
const WorkflowRunsContext = createContext({
  refreshWorkflowRuns: false,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setRefreshWorkflowRuns: (_value: boolean) => {},
  workflowRunDetail: {} as ReturnType<typeof useWorkflowRunDetailModel>['data'],
  isFetchingWorkflowRunDetail: true,
  // comment
  workflowCommentData: {} as ReturnType<typeof useWorkflowRunCommentModel>['data'],
  isFetchingWorkflowComment: true,
  refetchWorkflowComment: () => {},
  // state
  workflowStateData: {} as ReturnType<typeof useWorkflowStateModel>['data'],
  isFetchingWorkflowState: true,
  refetchWorkflowState: () => {},
  // valid state
  workflowRunStateCreationValidMapData: {} as ReturnType<
    typeof useWorkflowRunStateCreationValidMapModel
  >['data'],
  isFetchingWorkflowRunStateCreationValidMap: true,
  // rerun validate
  workflowRunRerunValidMapData: {} as ReturnType<typeof useWorkflowRunRerunValidateModel>['data'],
  isFetchingWorkflowRunRerunValidMap: true,
});

export const WorkflowRunsProvider: FC<PropsWithChildren> = ({ children }): ReactElement => {
  const [refreshWorkflowRuns, setRefreshWorkflowRuns] = useState<boolean>(false);
  const { orcabusId } = useParams();

  const {
    data: workflowRunDetail,
    isFetching: isFetchingWorkflowRunDetail,
    refetch: refetchWorkflowRunDetail,
  } = useWorkflowRunDetailModel({
    params: { path: { orcabusId: (orcabusId as string).split('.')[1] } },
    reactQuery: {
      enabled: !!orcabusId,
    },
  });
  const {
    data: workflowCommentData,
    isFetching: isFetchingWorkflowComment,
    refetch: refetchWorkflowComment,
  } = useWorkflowRunCommentModel({
    params: { path: { orcabusId: orcabusId as string } },
    reactQuery: {
      enabled: !!orcabusId,
    },
  });
  const {
    data: workflowStateData,
    isFetching: isFetchingWorkflowState,
    refetch: refetchWorkflowState,
  } = useWorkflowStateModel({
    params: { path: { orcabusId: orcabusId as string } },
    reactQuery: {
      enabled: !!orcabusId,
    },
  });

  const {
    data: workflowRunStateCreationValidMapData,
    isFetching: isFetchingWorkflowRunStateCreationValidMap,
  } = useWorkflowRunStateCreationValidMapModel({
    params: { path: { orcabusId: orcabusId as string } },
    reactQuery: {
      enabled: !!orcabusId,
    },
  });

  const { data: workflowRunRerunValidMapData, isFetching: isFetchingWorkflowRunRerunValidMap } =
    useWorkflowRunRerunValidateModel({
      params: { path: { orcabusId: orcabusId as string } },
      reactQuery: {
        enabled: !!orcabusId,
      },
    });

  // refetch data (workflowRunDetail, workflowCommentData, workflowStateData) when refreshWorkflowRuns is true
  useEffect(() => {
    if (refreshWorkflowRuns) {
      refetchWorkflowRunDetail();
      refetchWorkflowComment();
      refetchWorkflowState();
    }
  }, [refreshWorkflowRuns, refetchWorkflowRunDetail, refetchWorkflowComment, refetchWorkflowState]);

  const isFetching =
    isFetchingWorkflowRunDetail ||
    isFetchingWorkflowComment ||
    isFetchingWorkflowState ||
    isFetchingWorkflowRunStateCreationValidMap ||
    isFetchingWorkflowRunRerunValidMap;

  return (
    <>
      {isFetching ? (
        <div className='h-screen'>
          <SpinnerWithText text='Loading...' />
        </div>
      ) : (
        <WorkflowRunsContext.Provider
          value={{
            refreshWorkflowRuns,
            setRefreshWorkflowRuns,
            workflowRunDetail,
            isFetchingWorkflowRunDetail,
            workflowCommentData,
            isFetchingWorkflowComment,
            refetchWorkflowComment,
            workflowStateData,
            isFetchingWorkflowState,
            refetchWorkflowState,
            workflowRunStateCreationValidMapData,
            isFetchingWorkflowRunStateCreationValidMap,
            workflowRunRerunValidMapData,
            isFetchingWorkflowRunRerunValidMap,
          }}
        >
          {children}
        </WorkflowRunsContext.Provider>
      )}
    </>
  );
};

export const useWorkflowRunsContext = () => {
  return useContext(WorkflowRunsContext);
};
