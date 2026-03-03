import { DetailedErrorBoundary } from '@/components/common/error';
import AnalysisFilterHeader from '../components/analysis/AnalysisFilterHeader';
import AnalysisTable from '../components/analysis/AnalysisTable';

const AnalysisTypesPage = () => {
  return (
    <DetailedErrorBoundary errorTitle='Unable to load workflow runs data'>
      <div className='h-full w-full'>
        {/* <div className='text-2xl font-bold py-2'>Workflow</div> */}
        {/* workflow run filter header */}
        <AnalysisFilterHeader />
        {/* workflow run table */}
        <AnalysisTable />
      </div>
    </DetailedErrorBoundary>
  );
};

export default AnalysisTypesPage;
