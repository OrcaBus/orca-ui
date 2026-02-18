import { SequenceRunSampleSheetProvider } from '../components/sequenceRuns/SequenceRunSampleSheetContext';
import SequenceRunSampleSheetComponent from '../components/sequenceRuns/SequenceRunSampleSheet';

const SequenceRunSampleSheets = () => {
  return (
    <SequenceRunSampleSheetProvider>
      <SequenceRunSampleSheetComponent />
    </SequenceRunSampleSheetProvider>
  );
};

export default SequenceRunSampleSheets;
