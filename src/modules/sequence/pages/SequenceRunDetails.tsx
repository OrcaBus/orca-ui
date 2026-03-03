import SequenceRunDetailsActions from '../components/sequenceRuns/SequenceRunDetailsActions';
import SequenceRunDetailsLinkage from '../components/sequenceRuns/SequenceRunDetailsLinkage';
import SequenceRunDetailsTimeline from '../components/sequenceRuns/SequenceRunDetailsTimeline';
import { SequenceRunDetailsProvider } from '../components/sequenceRuns/SequenceRunDetailsContext';

const SequenceRunDetails = () => {
  return (
    <SequenceRunDetailsProvider>
      <SequenceRunDetailsActions />
      <SequenceRunDetailsLinkage />
      <SequenceRunDetailsTimeline />
    </SequenceRunDetailsProvider>
  );
};

export default SequenceRunDetails;
