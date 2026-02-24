import { useQueryParams } from '@/hooks/useQueryParams';
import { Search } from '@/components/common/search';
import { Button } from '@/components/common/buttons';
import { Tooltip } from '@/components/common/tooltips';
import { classNames } from '@/utils/commonUtils';
import { XCircleIcon } from '@heroicons/react/24/outline';

const AnalysisFilterHeader = () => {
  const { setQueryParams, clearQueryParams, getQueryParams } = useQueryParams();
  return (
    <div className='flex w-full flex-row items-center justify-between gap-1 p-2 md:flex-row'>
      <div className='w-1/4'>
        <Search
          onSearch={(searchContent) => setQueryParams({ search: searchContent })}
          searchBoxContent={getQueryParams().search || ''}
          hasTooltip={false}
        />
      </div>

      <div className='flex flex-row items-center gap-2'>
        <div className='flex-none px-0'>
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
  );
};

export default AnalysisFilterHeader;
