import { useState } from 'react';
import { Button } from '@/components/common/buttons';
import { SpinnerWithText } from '@/components/common/spinner';
import { ArrowPathIcon } from '@heroicons/react/20/solid';
import { useMutationSyncGsheet } from '@/api/metadata';
import { classNames } from '@/utils/commonUtils';
import { SuccessTriggerWrapper } from './SuccessTriggerWrapper';

export const GsheetTrigger = () => {
  const currentYear = new Date().getFullYear();
  const startYear = 2017;
  const yearsArray = Array.from({ length: currentYear - startYear + 1 }, (_, i) => currentYear - i);
  const [yearSelected, setYearSelected] = useState(currentYear);

  const { data, isPending, isError, isSuccess, error, mutate, reset } = useMutationSyncGsheet({
    body: { year: yearSelected.toString() },
  });

  if (isPending) {
    return <SpinnerWithText text='Triggering sync with the Google tracking sheet' />;
  }

  if (isError) {
    throw error;
  }

  if (isSuccess) {
    return (
      <SuccessTriggerWrapper
        onClose={() => {
          setYearSelected(currentYear);
          reset();
        }}
      >
        {typeof data === 'string' ? data : JSON.stringify(data)}
      </SuccessTriggerWrapper>
    );
  }

  return (
    <div className='space-y-4'>
      <div>
        <label className='block text-sm font-medium text-gray-900 dark:text-white'>Year</label>
        <p className='text-xs text-gray-500 dark:text-gray-400'>
          The Google sheet tab to sync from
        </p>
        <select
          value={yearSelected}
          onChange={(e) => setYearSelected(parseInt(e.target.value))}
          className={classNames(
            'mt-2 block w-full rounded-lg px-3 py-2 text-sm',
            'bg-white dark:bg-gray-800',
            'border border-gray-300 dark:border-gray-600',
            'text-gray-900 dark:text-white',
            'focus:border-blue-500 focus:ring-blue-500 dark:focus:border-blue-400 dark:focus:ring-blue-400',
            'transition-colors duration-200'
          )}
        >
          {yearsArray.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      <Button
        onClick={() => mutate()}
        type='green'
        size='sm'
        className='w-full justify-center gap-2 shadow-sm transition-shadow duration-200 hover:shadow-md'
      >
        <ArrowPathIcon className='h-5 w-5' />
        Sync
      </Button>
    </div>
  );
};
