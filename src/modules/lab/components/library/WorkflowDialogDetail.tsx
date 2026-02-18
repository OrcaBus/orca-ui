import { useState } from 'react';
import { JsonToTable } from '@/components/common/json-to-table';
import { Dialog } from '@/components/common/dialogs';
import { Link } from 'react-router-dom';
import { classNames } from '@/utils/commonUtils';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';

export const WorkflowDialogDetail = ({
  portalRunId,
  workflowDetail,
}: {
  portalRunId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  workflowDetail: Record<string, any>;
}) => {
  const [isOpenWorkflowDetails, setIsOpenWorkflowDetails] = useState(false);

  return (
    <div
      className='ml-3 flex h-full cursor-pointer items-center text-xs font-light text-blue-500 hover:text-blue-700'
      onClick={() => setIsOpenWorkflowDetails(true)}
    >
      <div className='text-sm font-medium text-blue-500 underline hover:text-blue-700'>
        {portalRunId}
      </div>
      {isOpenWorkflowDetails && (
        <>
          <Dialog
            open={isOpenWorkflowDetails}
            size='lg'
            title={
              <div className='mb-6 flex items-center'>
                <div className='mr-6'>Workflow Details</div>
                <Link
                  to={`/workflows/workflow?search=${portalRunId}`}
                  className={classNames('flex items-center')}
                >
                  <ArrowTopRightOnSquareIcon className='h-5 w-5 text-blue-500 hover:text-blue-700' />
                </Link>
              </div>
            }
            content={<JsonToTable data={workflowDetail} />}
            onClose={() => setIsOpenWorkflowDetails(false)}
            closeBtn={{ label: 'Close', onClick: () => setIsOpenWorkflowDetails(false) }}
          />
        </>
      )}
    </div>
  );
};
