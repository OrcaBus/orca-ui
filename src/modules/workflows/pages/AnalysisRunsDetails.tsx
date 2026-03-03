import AnalysisRunsDetailsHeader from '../components/analysisRuns/AnalysisRunsDetailsHeader';
import AnalysisRunsDetailsCard from '../components/analysisRuns/AnalysisRunsDetailsCard';
import AnalysisRunsDetailsTabs from '../components/analysisRuns/AnalysisRunsDetailsTabs';
import { AnalysisRunsProvider } from '../components/analysisRuns/AnalysisRunsContext';

const AnalysisRunsDetailsPage = () => {
  return (
    <AnalysisRunsProvider>
      <div className='no-scrollbar flex h-full w-full flex-col gap-6 overflow-y-auto'>
        <AnalysisRunsDetailsHeader />
        <AnalysisRunsDetailsCard />
        <AnalysisRunsDetailsTabs />
      </div>
    </AnalysisRunsProvider>
  );
};

export default AnalysisRunsDetailsPage;
