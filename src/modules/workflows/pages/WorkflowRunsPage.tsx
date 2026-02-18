import { DetailedErrorBoundary } from '@/components/common/error';
import WorkflowRunsFilterHeader from '../components/workflowRuns/WorkflowRunsFilterHeader';
import WorkflowRunsTable from '../components/workflowRuns/WorkflowRunsTable';

const WorkflowRunsPage = () => {
  return (
    <DetailedErrorBoundary errorTitle='Unable to load workflow runs data'>
      <div className='h-full w-full'>
        {/* <div className='text-2xl font-bold py-2'>Workflow</div> */}
        {/* workflow run filter header */}
        <WorkflowRunsFilterHeader />
        {/* workflow run table */}
        <WorkflowRunsTable />
      </div>
    </DetailedErrorBoundary>
  );
};

export default WorkflowRunsPage;
