import { useSequenceRunContext } from './SequenceRunContext';
import { classNames } from '@/utils/commonUtils';
import Skeleton from 'react-loading-skeleton';
import { LinkTabs } from '@/components/navigation/tabs';
import { useLocation } from 'react-router-dom';

const SequenceRunDetailsHeader = () => {
  const { sequenceRunDetail, isFetchingSequenceRunDetail } = useSequenceRunContext();
  const pathname = useLocation().pathname;
  const tabs = [
    {
      name: 'Details',
      href: 'details',
      current: pathname.includes('/details'),
    },
    {
      name: 'Sample Sheet',
      href: 'samplesheet',
      current: pathname.includes('/samplesheet'),
    },
    {
      name: 'Workflow Runs',
      href: 'workflowruns',
      current: pathname.includes('/workflowruns'),
    },
  ];
  return (
    <div className={classNames('flex w-full flex-col gap-3', 'bg-white dark:bg-gray-900')}>
      {/* header: workflow run name */}
      {isFetchingSequenceRunDetail ? (
        <div className='flex-1'>
          <Skeleton height={20} />
        </div>
      ) : (
        <div>
          <div className='flex items-center justify-between pt-4 pb-1'>
            <div className='flex flex-col gap-2'>
              <h1 className='truncate text-xl font-semibold text-gray-900 dark:text-white'>
                {sequenceRunDetail?.[0]?.instrumentRunId}
              </h1>
              {/* <p className='text-sm text-gray-500 dark:text-gray-400'>
                {sequenceRunDetail?.instrumentRunId}
              </p> */}
            </div>
          </div>
          <div className='flex flex-col gap-2 py-2'>
            <LinkTabs tabs={tabs} />
          </div>
        </div>
      )}
    </div>
  );
};

export default SequenceRunDetailsHeader;
