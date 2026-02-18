/* eslint-disable react-refresh/only-export-components */

import { createContext, FC, PropsWithChildren, ReactElement, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { useAnalysisRunDetailModel, useWorkflowRunListModel } from '@/api/workflow';
import { SpinnerWithText } from '@/components/common/spinner';
import type { AnalysisRunModel } from '@/api/workflow';

interface AnalysisRunsContextValue {
  analysisRunDetail: AnalysisRunModel | undefined;
  isFetchingAnalysisRunDetail: boolean;
  workflowRunsCount: number;
}

const AnalysisRunsContext = createContext<AnalysisRunsContextValue>({
  analysisRunDetail: undefined,
  isFetchingAnalysisRunDetail: true,
  workflowRunsCount: 0,
});

export const AnalysisRunsProvider: FC<PropsWithChildren> = ({ children }): ReactElement => {
  const { orcabusId } = useParams();

  const { data: analysisRunDetail, isFetching: isFetchingAnalysisRunDetail } =
    useAnalysisRunDetailModel({
      params: { path: { orcabusId: orcabusId as string } },
      reactQuery: {
        enabled: !!orcabusId,
      },
    });

  const { data: workflowRunsData } = useWorkflowRunListModel({
    params: {
      query: {
        analysisRun: analysisRunDetail?.orcabusId ?? undefined,
        page: 1,
        rowsPerPage: 1,
      },
    },
    reactQuery: {
      enabled: !!analysisRunDetail?.orcabusId,
    },
  });

  const workflowRunsCount = workflowRunsData?.pagination?.count ?? 0;

  return (
    <>
      {isFetchingAnalysisRunDetail ? (
        <div className='flex h-screen items-center justify-center'>
          <SpinnerWithText text='Loading Analysis Run Details...' />
        </div>
      ) : (
        <AnalysisRunsContext.Provider
          value={{
            analysisRunDetail,
            isFetchingAnalysisRunDetail,
            workflowRunsCount,
          }}
        >
          {children}
        </AnalysisRunsContext.Provider>
      )}
    </>
  );
};

export const useAnalysisRunsContext = () => {
  return useContext(AnalysisRunsContext);
};
