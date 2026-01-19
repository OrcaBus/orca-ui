import { useMemo } from 'react';
import { useWorkflowRunContext } from './WorkflowRunContext';
import { Sidebar } from '@/components/common/sidebar';
import { AccordionList } from '@/components/common/accordion';
import { SpinnerWithText } from '@/components/common/spinner';

const WorkflowRunDetailsSidebar = () => {
  const { workflowRunDetail, isFetchingWorkflowRunDetail } = useWorkflowRunContext();
  // format data and disply in the table
  const workflowRunDetailsData = useMemo(
    () =>
      workflowRunDetail
        ? {
            workflowRunDetails: [
              {
                key: 'orcabusId',
                value: workflowRunDetail.orcabusId,
              },
              {
                key: 'portalRunId',
                value: workflowRunDetail.portalRunId,
              },
              {
                key: 'executionId',
                value: workflowRunDetail.executionId || '-',
              },
            ],
            workflowDetails: [
              {
                key: 'workflowName',
                value: workflowRunDetail.workflow.name,
              },
              {
                key: 'workflowVersion',
                value: workflowRunDetail.workflow.version,
              },
              {
                key: 'executionEngine',
                value: workflowRunDetail.workflow.executionEngine || '-',
              },
              {
                key: 'executionEnginePipelineId',
                value: workflowRunDetail.workflow.executionEnginePipelineId || '-',
              },
            ],
            analysisDetails: [
              {
                key: 'analysisId',
                value: workflowRunDetail?.analysisRun?.analysis.orcabusId || '-',
              },
              {
                key: 'analysisName',
                value: workflowRunDetail?.analysisRun?.analysis.analysisName || '-',
              },
              {
                key: 'analysisVersion',
                value: workflowRunDetail?.analysisRun?.analysis.analysisVersion || '-',
              },
              {
                key: 'analysisStatus',
                value: workflowRunDetail?.analysisRun?.analysis.status || '-',
              },
            ],
            analysisRunDetails: [
              {
                key: 'analysisRunId',
                value: workflowRunDetail?.analysisRun?.orcabusId || '-',
              },
              {
                key: 'analysisRunName',
                value: workflowRunDetail?.analysisRun?.analysisRunName || '-',
              },
              {
                key: 'analysisRunStatus',
                value: workflowRunDetail?.analysisRun?.analysis?.status || '-',
              },
              {
                key: 'analysisRunComment',
                value: workflowRunDetail?.analysisRun?.comment || '-',
              },
              {
                key: 'storageContextId',
                value: workflowRunDetail?.analysisRun?.storageContext?.orcabusId || '-',
              },
              {
                key: 'storageContextName',
                value: workflowRunDetail?.analysisRun?.storageContext?.name || '-',
              },
              {
                key: 'storageContextUsecase',
                value: workflowRunDetail?.analysisRun?.storageContext?.usecase || '-',
              },
              {
                key: 'computeContextId',
                value: workflowRunDetail?.analysisRun?.computeContext?.orcabusId || '-',
              },
              {
                key: 'computeContextName',
                value: workflowRunDetail?.analysisRun?.computeContext?.name || '-',
              },
              {
                key: 'computeContextUsecase',
                value: workflowRunDetail?.analysisRun?.computeContext?.usecase || '-',
              },
            ],
          }
        : null,
    [workflowRunDetail]
  );

  return (
    <Sidebar
      position='right'
      className='border-r-0'
      preferenceStorageKey='workflow-run-details-sidebar'
      openWidth='w-100'
    >
      <div className='mt-14'>
        {isFetchingWorkflowRunDetail ? (
          <div className='flex h-full items-center justify-center'>
            <SpinnerWithText text='Loading Workflow Run Details...' />
          </div>
        ) : workflowRunDetailsData ? (
          <div className='space-y-2'>
            <AccordionList
              title='Run Details'
              data={workflowRunDetailsData?.workflowRunDetails || []}
              defaultOpen={true}
              chevronPosition='right'
              buttonClassName='border-b  border-gray-200 dark:border-gray-700'
            />

            <AccordionList
              title='Workflow Details'
              data={workflowRunDetailsData?.workflowDetails || []}
              defaultOpen={true}
              chevronPosition='right'
              buttonClassName='border-b border-gray-200 dark:border-gray-700'
            />

            <AccordionList
              title='Analysis Details'
              data={workflowRunDetailsData?.analysisDetails || []}
              defaultOpen={false}
              chevronPosition='right'
              buttonClassName='border-b border-gray-200 dark:border-gray-700'
            />

            <AccordionList
              title='Analysis Run Details'
              data={workflowRunDetailsData?.analysisRunDetails || []}
              defaultOpen={false}
              chevronPosition='right'
              buttonClassName='border-b border-gray-200 dark:border-gray-700'
            />
          </div>
        ) : (
          <div className='flex h-full items-center justify-center'>No data</div>
        )}
      </div>
    </Sidebar>
  );
};

export default WorkflowRunDetailsSidebar;
