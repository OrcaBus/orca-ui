import { useSequenceRunContext } from './SequenceRunContext';
import { useWorkflowRunStatusCountModel } from '@/api/workflow';
import { SpinnerWithText } from '@/components/common/spinner';
import { classNames } from '@/utils/commonUtils';
import { QueueListIcon } from '@heroicons/react/24/outline';
import { useQueryParams } from '@/hooks/useQueryParams';
import { dayjs } from '@/utils/dayjs';
const NoWorkflowsFound = () => (
  <div className='flex h-full items-center justify-center rounded-lg border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-900'>
    <div className='flex flex-col items-center gap-3 text-center'>
      <div className='rounded-full bg-gray-100 p-3 dark:bg-gray-800'>
        <QueueListIcon className='h-8 w-8 text-gray-400 dark:text-gray-500' />
      </div>
      <div>
        <h3 className='mb-1 text-base font-medium text-gray-900 dark:text-gray-100'>
          No Workflow Runs
        </h3>
        <p className='text-sm text-gray-500 dark:text-gray-400'>
          No workflow runs have been found for this sequence run.
        </p>
      </div>
    </div>
  </div>
);

const SequenceRunWorkflowRunsStats = () => {
  const { setQueryParams, getQueryParams } = useQueryParams();
  const { sequenceRunDetail } = useSequenceRunContext();

  const selectedStatus = getQueryParams().workflowRunStatus;

  // lastest run library ids
  const libraryIds = sequenceRunDetail?.sort((a, b) => {
    return dayjs(b.endTime).diff(dayjs(a.endTime));
  })[0]?.libraries;
  // time range (first run end time  to 2 days after)
  const start_time = sequenceRunDetail?.sort((a, b) => {
    return dayjs(a.endTime).diff(dayjs(b.endTime));
  })[0]?.endTime;
  // Set end_time to be 2 days after start_time, but not after now
  const calculatedEndTime = dayjs(start_time).add(2, 'days');
  const now = dayjs();
  const end_time = calculatedEndTime.isAfter(now)
    ? now.toISOString()
    : calculatedEndTime.toISOString();

  const { data: workflowRunsCount, isLoading: isLoadingWorkflowRuns } =
    useWorkflowRunStatusCountModel({
      params: {
        query: {
          libraries__libraryId: libraryIds,
          start_time: start_time,
          end_time: end_time,
        },
      },
    });

  if (isLoadingWorkflowRuns) {
    return (
      <div className='flex h-full items-center justify-center'>
        <SpinnerWithText text='Loading workflow runs...' />
      </div>
    );
  }

  if (!libraryIds || libraryIds.length === 0 || !workflowRunsCount || workflowRunsCount.all === 0) {
    return <NoWorkflowsFound />;
  }

  const handleStatusClick = (status: string) => {
    if (selectedStatus === status || status === 'all') {
      setQueryParams({ workflowRunStatus: null, page: 1 });
    } else {
      setQueryParams({ workflowRunStatus: status, page: 1 });
    }
  };

  if (!workflowRunsCount) {
    return (
      <div className='flex h-full items-center justify-center rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900'>
        <p className='text-sm text-gray-500 dark:text-gray-400'>No workflow runs found</p>
      </div>
    );
  }

  return (
    <div className='grid grid-cols-7 gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-xs dark:border-gray-700 dark:bg-gray-900'>
      {Object.keys(workflowRunsCount).map((key, idx) => (
        <div
          key={idx}
          onClick={() => handleStatusClick(key)}
          className={classNames(
            'col-span-1 flex cursor-pointer flex-col justify-center gap-1.5 rounded-md p-3 transition-all duration-200',
            'border border-transparent',
            selectedStatus === key
              ? 'border-blue-100 bg-blue-50 dark:border-blue-500/20 dark:bg-blue-900/20'
              : 'hover:border-gray-200 hover:bg-gray-50 hover:shadow-xs dark:hover:border-gray-700 dark:hover:bg-gray-800/50',
            'group overflow-hidden'
          )}
        >
          <h3
            className={classNames(
              'text-xs font-medium transition-colors',
              selectedStatus === key
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-300'
            )}
          >
            {key.toUpperCase()}
          </h3>
          <p
            className={classNames(
              'text-xl font-semibold tracking-tight transition-colors',
              selectedStatus === key
                ? 'text-blue-700 dark:text-blue-300'
                : 'text-gray-900 dark:text-white'
            )}
          >
            {workflowRunsCount[key as keyof typeof workflowRunsCount]}
          </p>
        </div>
      ))}
    </div>
  );
};

export default SequenceRunWorkflowRunsStats;
