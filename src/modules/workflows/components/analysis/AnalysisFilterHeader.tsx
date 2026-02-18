import { useQueryParams } from '@/hooks/useQueryParams';
import { Search } from '@/components/common/search';
import { Button } from '@/components/common/buttons';

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
          <Button
            size='md'
            onClick={() => {
              clearQueryParams();
            }}
            className='text-gray-400 hover:text-white'
          >
            Clear all
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AnalysisFilterHeader;
