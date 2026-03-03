/* eslint-disable react-refresh/only-export-components */
// https://github.com/ArnaudBarre/eslint-plugin-react-refresh/issues/25#issuecomment-1729071347

import { createContext, FC, PropsWithChildren, ReactElement, useContext } from 'react';
import {
  useSequenceRunByInstrumentRunIdModel,
  useSequenceRunCommentsByInstrumentRunIdModel,
} from '@/api/sequenceRun';
import { useParams } from 'react-router-dom';
import { SpinnerWithText } from '@/components/common/spinner';

const SequenceRunContext = createContext({
  // refreshSequenceRuns: false,
  // //eslint-disable-next-line @typescript-eslint/no-unused-vars
  // setRefreshSequenceRuns: (_value: boolean) => {},
  sequenceRunDetail: undefined as ReturnType<typeof useSequenceRunByInstrumentRunIdModel>['data'],
  isFetchingSequenceRunDetail: true,
  refetchSequenceRunDetail: () => {},

  // comment
  sequenceRunCommentData: undefined as ReturnType<
    typeof useSequenceRunCommentsByInstrumentRunIdModel
  >['data'],
  isFetchingSequenceRunComment: true,
  refetchSequenceRunComment: () => {},
});

export const SequenceRunProvider: FC<PropsWithChildren> = ({ children }): ReactElement => {
  // const [refreshSequenceRuns, setRefreshSequenceRuns] = useState<boolean>(false);
  const { instrumentRunId } = useParams();

  const {
    data: sequenceRunDetail,
    isFetching: isFetchingSequenceRunDetail,
    refetch: refetchSequenceRunDetail,
  } = useSequenceRunByInstrumentRunIdModel({
    params: { path: { instrumentRunId: instrumentRunId as string } },
    reactQuery: {
      enabled: !!instrumentRunId,
    },
  });

  const {
    data: sequenceRunCommentData,
    isFetching: isFetchingSequenceRunComment,
    refetch: refetchSequenceRunComment,
  } = useSequenceRunCommentsByInstrumentRunIdModel({
    params: { path: { instrumentRunId: instrumentRunId as string } },
    reactQuery: {
      enabled: !!instrumentRunId,
    },
  });

  const isFetching = isFetchingSequenceRunDetail || isFetchingSequenceRunComment;

  return (
    <>
      {isFetching ? (
        <div className='h-screen'>
          <SpinnerWithText text='Loading ...' />
        </div>
      ) : (
        <SequenceRunContext.Provider
          value={{
            // refreshSequenceRuns,
            // setRefreshSequenceRuns,
            sequenceRunDetail,
            isFetchingSequenceRunDetail,
            refetchSequenceRunDetail,
            sequenceRunCommentData,
            isFetchingSequenceRunComment,
            refetchSequenceRunComment,
          }}
        >
          {children}
        </SequenceRunContext.Provider>
      )}
    </>
  );
};

export const useSequenceRunContext = () => {
  return useContext(SequenceRunContext);
};
