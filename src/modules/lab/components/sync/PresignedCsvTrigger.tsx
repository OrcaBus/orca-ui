import { useState } from 'react';
import { Button } from '@/components/common/buttons';
import { SpinnerWithText } from '@/components/common/spinner';
import { ArrowPathIcon } from '@heroicons/react/20/solid';
import { useMutationSyncCustomCsv } from '@/api/metadata';
import { classNames } from '@/utils/commonUtils';
import { SuccessTriggerWrapper } from './SuccessTriggerWrapper';

export const PresignedCsvTrigger = () => {
  const [urlInput, setUrlInput] = useState<string>('');
  const [reason, setReason] = useState<string>('');

  const { data, isPending, isError, isSuccess, error, mutate, reset } = useMutationSyncCustomCsv({
    body: { presignedUrl: urlInput, reason: reason ? reason : undefined },
  });

  if (isPending) {
    return <SpinnerWithText text='Triggering sync from given presigned url' />;
  }

  if (isError) {
    throw error;
  }

  if (isSuccess) {
    return (
      <SuccessTriggerWrapper
        onClose={() => {
          setUrlInput('');
          setReason('');
          reset();
        }}
      >
        {String(data)}
      </SuccessTriggerWrapper>
    );
  }

  return (
    <div className='space-y-4'>
      <div>
        <label className='block text-sm font-medium text-gray-900 dark:text-white'>
          CSV Presigned URL
        </label>
        <p className='text-xs text-gray-500 dark:text-gray-400'>
          Format:{' '}
          <a
            className='text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300'
            href='https://github.com/umccr/orcabus/blob/main/lib/workload/stateless/stacks/metadata-manager/README.md#custom-csv-file-loader'
            target='_blank'
            rel='noopener noreferrer'
          >
            GitHub
          </a>
        </p>
        <input
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          placeholder='Enter presigned URL'
          className={classNames(
            'mt-2 block w-full rounded-lg px-3 py-2 text-sm',
            'bg-white dark:bg-gray-800',
            'border border-gray-300 dark:border-gray-600',
            'text-gray-900 dark:text-white',
            'focus:border-blue-500 focus:ring-blue-500 dark:focus:border-blue-400 dark:focus:ring-blue-400',
            'transition-colors duration-200'
          )}
        />
      </div>

      <div>
        <label className='block text-sm font-medium text-gray-900 dark:text-white'>Reason</label>
        <p className='text-xs text-gray-500 dark:text-gray-400'>
          Optional reason or comment for the sync
        </p>
        <input
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder='Enter reason (optional)'
          className={classNames(
            'mt-2 block w-full rounded-lg px-3 py-2 text-sm',
            'bg-white dark:bg-gray-800',
            'border border-gray-300 dark:border-gray-600',
            'text-gray-900 dark:text-white',
            'focus:border-blue-500 focus:ring-blue-500 dark:focus:border-blue-400 dark:focus:ring-blue-400',
            'transition-colors duration-200'
          )}
        />
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
