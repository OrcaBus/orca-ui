import { FC } from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { Dialog } from '@/components/common/dialogs';
import { Checkbox } from '@/components/common/checkbox';
import RNASUMSelect from './RNASUMSelect';
import type { WorkflowRunRerunValidMapDataModel } from '@/api/workflow';

interface RerunDialogProps {
  isOpenRerunWorkflowDialog: boolean;
  workflowRunName: string;
  workflowName: string;
  workflowRunRerunValidMapData: WorkflowRunRerunValidMapDataModel | null;
  selectedDataset: string;
  setSelectedDataset: (dataset: string) => void;
  isDeprecated: boolean;
  setIsDeprecated: (isDeprecated: boolean) => void;
  handleCloseRerunWorkflowDialog: () => void;
  handleRerunWorkflow: () => void;
  isFetchingWorkflowRunRerunValidMap: boolean;
}

const RerunDialog: FC<RerunDialogProps> = ({
  isOpenRerunWorkflowDialog,
  workflowRunName,
  workflowName,
  workflowRunRerunValidMapData,
  selectedDataset,
  setSelectedDataset,
  isDeprecated,
  setIsDeprecated,
  handleCloseRerunWorkflowDialog,
  handleRerunWorkflow,
  isFetchingWorkflowRunRerunValidMap,
}) => {
  return (
    <Dialog
      TitleIcon={ArrowPathIcon}
      title='Rerun Workflow'
      open={isOpenRerunWorkflowDialog}
      className='md:max-w-7xl'
      content={
        <div>
          <div className='text-lg font-medium'>{workflowRunName || ''}</div>

          <div className='flex flex-row gap-2 py-2'>
            <div className='text-xs font-medium'>Description:</div>
            <div className='text-xs text-gray-500'>Report trigger for the RNAsum workflow.</div>
          </div>

          {/* divider */}
          <div className='my-2 h-px bg-gray-200'></div>

          {!workflowRunRerunValidMapData?.isValid ? (
            <div className='mt-2 flex flex-col gap-1 text-sm'>
              <div className='flex flex-row gap-1 text-red-500'>
                <span className='font-medium'>Warning:</span>
                <span>This workflow is not allowed to rerun.</span>
              </div>
              <div className='flex flex-row gap-1 text-gray-500'>
                <span className='font-medium'>Reason:</span>
                <span>
                  Current workflow is not in the allowed workflows:{' '}
                  {workflowRunRerunValidMapData?.validWorkflows.join(', ')}
                </span>
              </div>
            </div>
          ) : (
            <>
              <div className='mx-1 mt-2 flex flex-col gap-1 text-sm'>
                <div>
                  <div className='mb-1 pt-1 text-xs font-medium'>
                    Please select the{' '}
                    <a
                      href='https://github.com/umccr/RNAsum/blob/master/TCGA_projects_summary.md'
                      target='_blank'
                      rel='noreferrer'
                      className='text-blue-500'
                    >
                      TCGA
                    </a>{' '}
                    dataset to rerun:
                  </div>
                  <div className='w-full px-1 py-2'>
                    <RNASUMSelect
                      availableOptions={workflowRunRerunValidMapData?.allowedDatasetChoice || []}
                      selectedValue={selectedDataset || null}
                      onChange={setSelectedDataset}
                      placeholder='Search datasets...'
                    />
                  </div>
                  {!selectedDataset && (
                    <div className='text-xs text-red-500'>Please select a dataset.</div>
                  )}
                </div>
                {/* divider */}
                <div className='my-2 h-px bg-gray-200'></div>
                {/* deprecated checkbox */}
                <div>
                  {workflowName !== 'RNASUM' ? (
                    <div className='text-xs text-red-500'>
                      Marking current workflow run as deprecated is not available for RNASUM
                      workflow.
                    </div>
                  ) : (
                    <div>
                      <Checkbox
                        className='flex flex-row gap-2 text-sm font-medium'
                        checked={isDeprecated}
                        onChange={() => setIsDeprecated(!isDeprecated)}
                        disabled={!selectedDataset || workflowName !== 'RNASUM'}
                        label="Mark the current run as 'DEPRECATED'."
                      />

                      <div className='text-xs text-gray-500'>
                        This action will mark the current run as &apos;DEPRECATED&apos;, and is
                        irreversible.
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className='mt-2 pt-2 text-sm font-medium text-red-500'>
                Are you sure you want to rerun this workflow?
              </div>
            </>
          )}
        </div>
      }
      onClose={handleCloseRerunWorkflowDialog}
      closeBtn={{
        label: 'Close',
        onClick: handleCloseRerunWorkflowDialog,
      }}
      confirmBtn={{
        label: 'Rerun',
        onClick: handleRerunWorkflow,
        disabled:
          isFetchingWorkflowRunRerunValidMap ||
          !workflowRunRerunValidMapData?.isValid ||
          !selectedDataset,
      }}
    />
  );
};

export default RerunDialog;
