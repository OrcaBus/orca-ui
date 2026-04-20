import { useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/common/buttons';
import { IconMultipleSelect } from '@/components/common/select';
import { DateRangePicker } from '@/components/common/datepicker';
import { Search } from '@/components/common/search';
import { ButtonGroup } from '@/components/common/buttons';
import { useWorkflowRunStatusCountModel, useWorkflowModel } from '@/api/workflow';
import type { WorkflowModel } from '@/api/workflow';
import { useQueryParams } from '@/hooks/useQueryParams';
import { DEFAULT_NON_PAGINATE_PAGE_SIZE } from '@/utils/constant';
import { keepPreviousData } from '@tanstack/react-query';
import { Tooltip } from '@/components/common/tooltips';
import { XCircleIcon } from '@heroicons/react/24/outline';
import { classNames } from '@/utils/commonUtils';

function parseWorkflowTypeIds(raw: string | string[] | undefined): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

const WorkflowRunsFilterHeader = () => {
  // bugfix: if set array object to state, it will be refresh the page continuously as the object is always new
  // Convert selectedWorkflowTypeIds to selectedWorkflowTypeIdsStr: selectedWorkflowTypeIds.sort().join(',')

  const [searchParams] = useSearchParams();
  const { setQueryParams, clearQueryParams, getQueryParams } = useQueryParams();

  const getWorkflowTypeIds = () => parseWorkflowTypeIds(getQueryParams().workflowTypeId);

  // Normalize URL: multiple workflowTypeId params → single comma-separated param
  // Use searchParams.getAll for stable dependency (only changes when URL changes)
  const workflowTypeIdRaw = searchParams.getAll('workflowTypeId').join(',');
  useEffect(() => {
    const workflowTypeIds = parseWorkflowTypeIds(workflowTypeIdRaw ? workflowTypeIdRaw : undefined);
    const normalized = workflowTypeIds.length === 0 ? null : workflowTypeIds.sort().join(',');
    const currentValue = workflowTypeIdRaw || null;
    if (normalized !== currentValue) {
      setQueryParams({ workflowTypeId: normalized });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- setQueryParams is intentionally omitted; we only run when workflowTypeIdRaw changes to avoid render loops
  }, [workflowTypeIdRaw]);

  const { data: workflowData } = useWorkflowModel({
    params: {
      query: { page: 1, rowsPerPage: DEFAULT_NON_PAGINATE_PAGE_SIZE },
    },
  });

  const workflowTypeOptions = useMemo(
    () =>
      workflowData
        ? [
            { value: '-1', label: 'All workflows', secondaryLabel: '' },
            ...workflowData.results.map((workflowType: WorkflowModel) => ({
              value: workflowType.orcabusId?.toString().split('.')[1] || '',
              label: workflowType.name,
              secondaryLabel: 'v' + workflowType.version,
            })),
          ].sort((a, b) => a.label.localeCompare(b.label))
        : [],
    [workflowData]
  );

  const { data: workflowRunStatusCountData } = useWorkflowRunStatusCountModel({
    params: {
      query: {
        search: getQueryParams().search || undefined,
        workflow__orcabus_id: getQueryParams().workflowTypeId || undefined,
        start_time: getQueryParams().startDate || undefined,
        end_time: getQueryParams().endDate || undefined,
      },
    },
    reactQuery: {
      enabled: true,
      placeholderData: keepPreviousData,
    },
  });

  const workflowRunStatusOptions = useMemo(
    () =>
      workflowRunStatusCountData
        ? [
            ...Object.keys(workflowRunStatusCountData).map((status) => ({
              label: status.charAt(0).toUpperCase() + status.slice(1),
              subLabel:
                workflowRunStatusCountData[
                  status as keyof typeof workflowRunStatusCountData
                ].toString(),
              onClick: () => {
                if (status === 'all') {
                  setQueryParams({ workflowRunStatus: null });
                } else {
                  setQueryParams({ workflowRunStatus: status });
                }
              },
            })),
          ]
        : [
            ...[
              'All',
              'SUCCEEDED',
              'ABORTED',
              'FAILED',
              'RESOLVED',
              'DEPRECATED',
              'DRAFT',
              'ONGOING',
            ].map((status) => ({
              label: status,
              subLabel: '',
              onClick: () => {
                if (status === 'All') {
                  setQueryParams({ workflowRunStatus: null });
                } else {
                  setQueryParams({ workflowRunStatus: status.toLowerCase() });
                }
              },
            })),
          ],
    [setQueryParams, workflowRunStatusCountData]
  );

  const handleSelectWorkflowType = (selected: (string | number)[]) => {
    if (selected.length === 0 || selected.includes('-1')) {
      setQueryParams({ workflowTypeId: null });
    } else {
      const selectedWorkflowTypeIds = selected.map((id) => id.toString());
      setQueryParams({ workflowTypeId: selectedWorkflowTypeIds });
    }
  };

  const handleTimeChange = (startDate: string | null, endDate: string | null) => {
    setQueryParams({ startDate, endDate });
  };

  return (
    <>
      <div className='flex w-full flex-row items-center justify-between gap-1 p-2 md:flex-row'>
        <div className='w-1/3'>
          <Search
            onSearch={(searchContent) => setQueryParams({ search: searchContent })}
            searchBoxContent={getQueryParams().search || ''}
            hasTooltip
            tooltipText='Available Search Items: workflowRunName, comment, libraryId, orcabusId, workflowName'
          />
        </div>

        <div className='flex flex-row items-center gap-2'>
          <div className='flex-none'>
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
              selectedItemValues={getWorkflowTypeIds()}
              onApply={handleSelectWorkflowType}
              hasSelectAllOption={true}
              selectAllOptionValue='-1'
            />
          </div>

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
          buttonItems={workflowRunStatusOptions}
          selectedItemLabel={getQueryParams().workflowRunStatus || 'all'}
        />
      </div>
    </>
  );
};

export default WorkflowRunsFilterHeader;
