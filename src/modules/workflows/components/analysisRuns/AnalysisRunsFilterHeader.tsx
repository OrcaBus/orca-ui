import { useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/common/buttons';
import { IconMultipleSelect } from '@/components/common/select';
import { DateRangePicker } from '@/components/common/datepicker';
import { Search } from '@/components/common/search';
import { ButtonGroup } from '@/components/common/buttons';
import { useAnalysisRunStatusCountModel, useAnalysisListModel } from '@/api/workflow';
import type { AnalysisModel } from '@/api/workflow';
import { useQueryParams } from '@/hooks/useQueryParams';
import { DEFAULT_NON_PAGINATE_PAGE_SIZE } from '@/utils/constant';
import { keepPreviousData } from '@tanstack/react-query';
import { Tooltip } from '@/components/common/tooltips';
import { XCircleIcon } from '@heroicons/react/24/outline';
import { classNames } from '@/utils/commonUtils';

function parseAnalysisTypeIds(raw: string | string[] | undefined): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

const AnalysisRunsFilterHeader = () => {
  const [searchParams] = useSearchParams();
  const { setQueryParams, clearQueryParams, getQueryParams } = useQueryParams();

  const getAnalysisTypeIds = () => parseAnalysisTypeIds(getQueryParams().analysisTypeId);

  const analysisTypeIdRaw = searchParams.getAll('analysisTypeId').join(',');
  useEffect(() => {
    const analysisTypeIds = parseAnalysisTypeIds(analysisTypeIdRaw ? analysisTypeIdRaw : undefined);
    const normalized = analysisTypeIds.length === 0 ? null : analysisTypeIds.sort().join(',');
    const currentValue = analysisTypeIdRaw || null;
    if (normalized !== currentValue) {
      setQueryParams({ analysisTypeId: normalized });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- setQueryParams is intentionally omitted; we only run when analysisTypeIdRaw changes to avoid render loops
  }, [analysisTypeIdRaw]);

  const { data: analysisListData } = useAnalysisListModel({
    params: {
      query: { page: 1, rowsPerPage: DEFAULT_NON_PAGINATE_PAGE_SIZE },
    },
  });

  const analysisTypeOptions = useMemo(
    () =>
      analysisListData
        ? [
            { value: '-1', label: 'All analyses', secondaryLabel: '' },
            ...analysisListData.results.map((analysisType: AnalysisModel) => ({
              value: analysisType.orcabusId?.toString() ?? '',
              label: analysisType.analysisName,
              secondaryLabel: 'v' + analysisType.analysisVersion,
            })),
          ].sort((a, b) => a.label.localeCompare(b.label))
        : [],
    [analysisListData]
  );

  const { data: analysisRunStatusCountData } = useAnalysisRunStatusCountModel({
    params: {
      query: {
        search: getQueryParams().search || undefined,
        analysis__orcabus_id: getQueryParams().analysisTypeId || undefined,
        start_time: getQueryParams().startDate || undefined,
        end_time: getQueryParams().endDate || undefined,
      },
    },
    reactQuery: {
      enabled: true,
      placeholderData: keepPreviousData,
    },
  });

  const analysisRunStatusOptions = useMemo(
    () =>
      analysisRunStatusCountData
        ? [
            ...Object.keys(analysisRunStatusCountData).map((status) => ({
              label: status.charAt(0).toUpperCase() + status.slice(1),
              subLabel:
                analysisRunStatusCountData[
                  status as keyof typeof analysisRunStatusCountData
                ].toString(),
              onClick: () => {
                if (status === 'all') {
                  setQueryParams({ analysisRunStatus: null });
                } else {
                  setQueryParams({ analysisRunStatus: status });
                }
              },
            })),
          ]
        : [
            ...['All', 'Succeeded', 'Aborted', 'Failed', 'Resolved', 'Deprecated', 'Ongoing'].map(
              (status) => ({
                label: status,
                subLabel: '',
                onClick: () => {
                  if (status === 'All') {
                    setQueryParams({ analysisRunStatus: null });
                  } else {
                    setQueryParams({ analysisRunStatus: status.toLowerCase() });
                  }
                },
              })
            ),
          ],
    [setQueryParams, analysisRunStatusCountData]
  );

  const handleSelectAnalysisType = (selected: (string | number)[]) => {
    if (selected.length === 0 || selected.includes('-1')) {
      setQueryParams({ analysisTypeId: null });
    } else {
      const selectedAnalysisTypeIds = selected.map((id) => id.toString());
      setQueryParams({ analysisTypeId: selectedAnalysisTypeIds });
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
            tooltipText='Available search items: analysisRunName, comment, libraryId, orcabusId, analysisName'
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
              options={analysisTypeOptions}
              selectedItemValues={getAnalysisTypeIds()}
              onApply={handleSelectAnalysisType}
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
          buttonItems={analysisRunStatusOptions}
          selectedItemLabel={getQueryParams().analysisRunStatus || 'all'}
        />
      </div>
    </>
  );
};

export default AnalysisRunsFilterHeader;
