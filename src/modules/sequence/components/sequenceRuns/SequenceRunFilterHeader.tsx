import { Search } from '@/components/common/search';
import { Button, ButtonGroup } from '@/components/common/buttons';
import { useQueryParams } from '@/hooks/useQueryParams';
import { DateRangePicker } from '@/components/common/datepicker';
import { useSequenceRunStatusCountModel } from '@/api/sequenceRun';
import { keepPreviousData } from '@tanstack/react-query';
import { useMemo } from 'react';
import { XCircleIcon } from '@heroicons/react/24/outline';
import { Tooltip } from '@/components/common/tooltips';
import { classNames } from '@/utils/commonUtils';
const SequenceRunFilterHeader = () => {
  const { setQueryParams, clearQueryParams, getQueryParams } = useQueryParams();
  const handleTimeChange = (startDate: string | null, endDate: string | null) => {
    setQueryParams({ startDate, endDate });
  };

  // get sequence run status count
  const { data: sequenceRunStatusCountData } = useSequenceRunStatusCountModel({
    params: {
      query: {
        search: getQueryParams().search || undefined,
        start_time: getQueryParams().startDate || undefined,
        end_time: getQueryParams().endDate || undefined,
      },
    },
    reactQuery: {
      enabled: true,
      placeholderData: keepPreviousData,
    },
  });

  const sequenceRunStatusOptions = useMemo(() => {
    return sequenceRunStatusCountData
      ? [
          ...Object.keys(sequenceRunStatusCountData).map((status) => ({
            label: status.charAt(0).toUpperCase() + status.slice(1),
            subLabel:
              sequenceRunStatusCountData[
                status as keyof typeof sequenceRunStatusCountData
              ].toString(),
            onClick: () => {
              if (status === 'all') {
                setQueryParams({ sequenceRunStatus: null });
              } else {
                setQueryParams({ sequenceRunStatus: status });
              }
            },
          })),
        ]
      : [
          ...['All', 'Started', 'Succeeded', 'Failed', 'Aborted'].map((status) => ({
            label: status,
            subLabel: '',
            onClick: () => {
              if (status === 'All') {
                setQueryParams({ sequenceRunStatus: null });
              } else {
                setQueryParams({ sequenceRunStatus: status.toLowerCase() });
              }
            },
          })),
        ];
  }, [setQueryParams, sequenceRunStatusCountData]);
  return (
    <>
      <div className='flex w-full flex-row items-center justify-between gap-1 p-2 md:flex-row'>
        <div className='w-1/3'>
          <Search
            onSearch={(searchContent) => setQueryParams({ search: searchContent })}
            searchBoxContent={getQueryParams().search || ''}
            hasTooltip={false}
          />
        </div>

        <div className='flex flex-row items-center gap-2'>
          <DateRangePicker
            align='left'
            startDate={getQueryParams().startDate}
            endDate={getQueryParams().endDate}
            onTimeChange={handleTimeChange}
          />
          {/* <div className='flex-none'>
        <DateRangePicker
          align='left'
          startDate={getQueryParams().startDate}
          endDate={getQueryParams().endDate}
          onTimeChange={handleTimeChange}
        />
      </div>

      <div className='px-0'>
        <IconMultipleSelect
          options={workflowTypeOptions}
          selectedItemValues={selectedWorkflowTypeIdsStr.split(',')}
          onApply={handleSelectWorkflowType}
          hasSelectAllOption={true}
          selectAllOptionValue='-1'
        />
      </div> */}

          <div className='flex-none'>
            <Tooltip text='Clear all filters' size='small' background='light'>
              <Button
                size='md'
                onClick={() => {
                  clearQueryParams();
                }}
                className={classNames(
                  'inline-flex items-center rounded-md p-1.5',
                  'border border-gray-200 dark:border-gray-700',
                  'bg-white dark:bg-gray-800',
                  'text-gray-500 dark:text-gray-400',
                  'shadow-sm dark:shadow-gray-900/30',
                  'hover:bg-gray-50 dark:hover:bg-gray-700/50',
                  'hover:text-gray-600 dark:hover:text-gray-300',
                  'hover:border-gray-300 dark:hover:border-gray-600',
                  'focus:ring-2 focus:outline-none',
                  'focus:ring-blue-500/30 dark:focus:ring-blue-400/30',
                  'active:bg-gray-100 dark:active:bg-gray-700',
                  'transition-all duration-200'
                )}
              >
                <XCircleIcon className='h-5 w-5' />
                <span className='sr-only'>Clear all filters</span>
              </Button>
            </Tooltip>
          </div>
        </div>
      </div>
      <div>
        <ButtonGroup
          buttonItems={sequenceRunStatusOptions}
          selectedItemLabel={getQueryParams().sequenceRunStatus || 'all'}
        />
      </div>
    </>
  );
};

export default SequenceRunFilterHeader;
