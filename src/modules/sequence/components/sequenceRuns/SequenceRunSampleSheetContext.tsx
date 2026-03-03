/* eslint-disable react-refresh/only-export-components */
// https://github.com/ArnaudBarre/eslint-plugin-react-refresh/issues/25#issuecomment-1729071347

import { createContext, FC, PropsWithChildren, ReactElement, useContext } from 'react';
import { useSequenceRunSampleSheetsByInstrumentRunIdModel } from '@/api/sequenceRun';
import { useParams } from 'react-router-dom';
import { SpinnerWithText } from '@/components/common/spinner';

const SequenceRunSampleSheetContext = createContext({
  sequenceRunSampleSheetData: undefined as ReturnType<
    typeof useSequenceRunSampleSheetsByInstrumentRunIdModel
  >['data'],
  isFetchingSequenceRunSampleSheet: true,
  refetchSequenceRunSampleSheet: () => {},
});

export const SequenceRunSampleSheetProvider: FC<PropsWithChildren> = ({
  children,
}): ReactElement => {
  const { instrumentRunId } = useParams();

  const {
    data: sequenceRunSampleSheetData,
    isFetching: isFetchingSequenceRunSampleSheet,
    refetch: refetchSequenceRunSampleSheet,
  } = useSequenceRunSampleSheetsByInstrumentRunIdModel({
    params: { path: { instrumentRunId: instrumentRunId as string } },
    reactQuery: {
      enabled: !!instrumentRunId,
    },
  });

  return (
    <>
      {isFetchingSequenceRunSampleSheet ? (
        <div className='h-screen'>
          <SpinnerWithText text='Loading SequenceRun SampleSheet Data ...' />
        </div>
      ) : (
        <SequenceRunSampleSheetContext.Provider
          value={{
            sequenceRunSampleSheetData,
            isFetchingSequenceRunSampleSheet,
            refetchSequenceRunSampleSheet,
          }}
        >
          {children}
        </SequenceRunSampleSheetContext.Provider>
      )}
    </>
  );
};

export const useSequenceRunSampleSheetContext = () => {
  return useContext(SequenceRunSampleSheetContext);
};
