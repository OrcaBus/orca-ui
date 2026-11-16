import { useEffect, useState } from 'react';
import { FunnelIcon } from '@heroicons/react/24/outline';
import { ClosePopoverWrapper, PopoverDropdown } from '@/components/common/dropdowns';
import { Button } from '@/components/common/buttons';
import { useQueryParams } from '@/hooks/useQueryParams';
import { classNames } from '@/utils/commonUtils';
import { FilterTextInput } from '@/modules/lab/components/utils';

// Each key is the exact query param key sent to the API
type FilterType = {
  requestFormId?: string[];
  alias?: string[];
  description?: string[];
  type?: string[];
  isNataAccredited?: string[];
  studyName?: string[];
  studyId?: string[];
  urNumber?: string[];
  dueDate?: string[];
  latestState?: string[];
};

const FILTER_FIELDS: { key: keyof FilterType; title: string; placeholder?: string }[] = [
  { key: 'requestFormId', title: 'Request Form ID' },
  { key: 'alias', title: 'Alias' },
  { key: 'description', title: 'Description' },
  { key: 'type', title: 'Type' },
  { key: 'isNataAccredited', title: 'Nata Accredited', placeholder: 'true or false' },
  { key: 'studyName', title: 'Study Name' },
  { key: 'studyId', title: 'Study ID' },
  { key: 'urNumber', title: 'UR Number' },
  { key: 'dueDate', title: 'Due date', placeholder: 'YYYY-MM-DD' },
  { key: 'latestState', title: 'Latest State' },
];

export const CaseTableFilter = () => {
  const [filter, setFilter] = useState<FilterType>({});

  const { setQueryParams, getQueryParams, clearQueryParams } = useQueryParams();
  const filterJsonString = JSON.stringify(getQueryParams());
  useEffect(() => {
    setFilter(JSON.parse(filterJsonString));
  }, [filterJsonString]);

  const handleFilterChange = (key: keyof FilterType, value: string[]) => {
    setFilter((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <PopoverDropdown
      btnChildren={
        <Button
          type='gray'
          size='sm'
          className={classNames(
            'w-full justify-center rounded-md',
            'ring-1 ring-gray-300 dark:ring-gray-700',
            'hover:bg-gray-50 dark:hover:bg-gray-800',
            'transition-colors duration-200'
          )}
        >
          <FunnelIcon className='h-5 w-5' />
        </Button>
      }
      content={
        <div className='w-80 rounded-lg bg-white shadow-lg ring-1 ring-black/5 dark:bg-gray-900 dark:ring-white/10'>
          <div className='max-h-[500px] overflow-y-auto p-6 text-sm'>
            <div className='space-y-4'>
              {FILTER_FIELDS.map(({ key, title, placeholder }) => (
                <FilterTextInput<FilterType>
                  key={key}
                  title={title}
                  keyFilter={key}
                  defaultInput={filter[key] || []}
                  handleFilterChange={handleFilterChange}
                  placeholder={placeholder ?? `Enter ${title}...`}
                />
              ))}
            </div>
          </div>

          <div className='space-y-2 border-t border-gray-200 p-4 dark:border-gray-700'>
            <ClosePopoverWrapper>
              <Button
                className='w-full justify-center'
                type='red'
                onClick={() => clearQueryParams()}
              >
                Reset
              </Button>
            </ClosePopoverWrapper>

            <ClosePopoverWrapper>
              <Button
                className='w-full justify-center'
                type='primary'
                onClick={() => setQueryParams({ ...filter }, true)}
              >
                Apply
              </Button>
            </ClosePopoverWrapper>
          </div>
        </div>
      }
    />
  );
};
