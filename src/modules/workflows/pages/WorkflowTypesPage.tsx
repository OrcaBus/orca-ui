import { DetailedErrorBoundary } from '@/components/common/error';

import WorkflowsFilterHeader from '../components/workflows/WorkflowsFilterHeader';
import WorkflowsTable from '../components/workflows/WorkflowsTable';

const WorkflowTypesPage = () => {
  return (
    <DetailedErrorBoundary errorTitle='Unable to load workflow types data'>
      <div className='h-full w-full'>
        {/* <div className='text-2xl font-bold py-2'>Workflow</div> */}
        {/* workflow types filter header */}
        <WorkflowsFilterHeader />
        {/* workflow types table */}
        <WorkflowsTable />
      </div>
    </DetailedErrorBoundary>
  );
};

export default WorkflowTypesPage;
