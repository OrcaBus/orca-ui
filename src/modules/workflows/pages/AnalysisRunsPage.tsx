import { DetailedErrorBoundary } from '@/components/common/error';
import AnalysisRunsFilterHeader from '../components/analysisRuns/AnalysisRunsFilterHeader';
import AnalysisRunsTable from '../components/analysisRuns/AnalysisRunsTable';

const AnalysisRunsPage = () => {
  return (
    <DetailedErrorBoundary errorTitle='Unable to load workflow runs data'>
      <div className='h-full w-full'>
        {/* <div className='text-2xl font-bold py-2'>Workflow</div> */}
        {/* workflow run filter header */}
        <AnalysisRunsFilterHeader />
        {/* workflow run table */}
        <AnalysisRunsTable />
      </div>
    </DetailedErrorBoundary>
  );
};

export default AnalysisRunsPage;
