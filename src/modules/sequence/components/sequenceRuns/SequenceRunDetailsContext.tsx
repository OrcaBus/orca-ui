/* eslint-disable react-refresh/only-export-components */
// https://github.com/ArnaudBarre/eslint-plugin-react-refresh/issues/25#issuecomment-1729071347

import { createContext, FC, PropsWithChildren, ReactElement, useContext } from 'react';
import {
  useSequenceRunStatesByInstrumentRunIdModel,
  useSequenceRunStateValidMapModel,
} from '@/api/sequenceRun';
import { SpinnerWithText } from '@/components/common/spinner';
import { useParams } from 'react-router-dom';

const SequenceRunDetailsContext = createContext({
  // state
  sequenceRunStateData: undefined as ReturnType<
    typeof useSequenceRunStatesByInstrumentRunIdModel
  >['data'],
  isFetchingSequenceRunState: true,
  refetchSequenceRunState: () => {},
  // state valid map
  sequenceRunStateValidMapData: undefined as ReturnType<
    typeof useSequenceRunStateValidMapModel
  >['data'],
  isFetchingSequenceRunStateValidMap: true,
});

export const SequenceRunDetailsProvider: FC<PropsWithChildren> = ({ children }): ReactElement => {
  const { instrumentRunId } = useParams();

  const {
    data: sequenceRunStateData,
    isFetching: isFetchingSequenceRunState,
    refetch: refetchSequenceRunState,
  } = useSequenceRunStatesByInstrumentRunIdModel({
    params: { path: { instrumentRunId: instrumentRunId as string } },
    reactQuery: {
      enabled: !!instrumentRunId,
    },
  });

  const { data: sequenceRunStateValidMapData, isFetching: isFetchingSequenceRunStateValidMap } =
    useSequenceRunStateValidMapModel({
      params: { path: { instrumentRunId: instrumentRunId as string } },
      reactQuery: {
        enabled: !!instrumentRunId,
      },
    });

  const isFetching = isFetchingSequenceRunState || isFetchingSequenceRunStateValidMap;

  return (
    <>
      {isFetching ? (
        <div className='h-screen'>
          <SpinnerWithText text='Loading SequenceRun Details Data ...' />
        </div>
      ) : (
        <SequenceRunDetailsContext.Provider
          value={{
            sequenceRunStateData,
            isFetchingSequenceRunState,
            refetchSequenceRunState,
            sequenceRunStateValidMapData,
            isFetchingSequenceRunStateValidMap,
          }}
        >
          {children}
        </SequenceRunDetailsContext.Provider>
      )}
    </>
  );
};

export const useSequenceRunDetailsContext = () => {
  return useContext(SequenceRunDetailsContext);
};
