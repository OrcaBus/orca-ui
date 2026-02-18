import WorkflowRunsTimeline from '../components/workflowRuns/WorkflowRunsTimeline';
import WorkflowRunsDetailsHeader from '../components/workflowRuns/WorkflowRunsDetailsHeader';
import WorkflowRunsDetailsSidebar from '../components/workflowRuns/WorkflowRunsDetailsSidebar';
import WorkflowRunsDetailsLinkage from '../components/workflowRuns/WorkflowRunsDetailsLinkage';
import { WorkflowRunsProvider } from '../components/workflowRuns/WorkflowRunsContext';
import { SideBarLayout } from '@/components/common/sidebar';

const WorkflowRunsDetailsPage = () => {
  return (
    <WorkflowRunsProvider>
      <div className='no-scrollbar flex h-full w-full overflow-y-auto'>
        <div className='grow'>
          <SideBarLayout
            main={
              <div className='flex flex-col gap-4'>
                <WorkflowRunsDetailsHeader />
                <WorkflowRunsDetailsLinkage />
                <WorkflowRunsTimeline />
              </div>
            }
            mainClassName='no-scrollbar'
            sideBar={<WorkflowRunsDetailsSidebar />}
            sideBarClassName='overflow-y-auto no-scrollbar'
            sideBarPosition='right'
          />
        </div>
      </div>
    </WorkflowRunsProvider>
  );
};

export default WorkflowRunsDetailsPage;
