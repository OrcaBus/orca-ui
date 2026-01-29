import React, { useState } from 'react';
import { Button } from '@/components/common/buttons';
import { SpinnerWithText } from '@/components/common/spinner';
import { ArrowPathIcon, XMarkIcon } from '@heroicons/react/20/solid';
import { useMutationSyncCustomCsv, useMutationSyncGsheet } from '@/api/metadata';
import { DetailedErrorBoundary } from '@/components/common/error';
import { classNames } from '@/utils/commonUtils';

type SyncType = 'gsheet' | 'presigned-csv';

export default function SyncPage() {
  const [syncType, setSyncType] = useState<SyncType>('gsheet');

  return (
    <div className='max-w-3xl'>
      <div className='space-y-4'>
        <div className='mb-6'>
          <h2 className='text-lg font-semibold text-gray-900 dark:text-white'>Sync Metadata</h2>
          <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
            Select metadata source to sync with:
          </p>
        </div>

        <div className='rounded-lg bg-white p-6 shadow-sm dark:bg-gray-900'>
          <SyncSelector onChange={setSyncType} value={syncType} />

          {syncType && (
            <div className='mt-6 border-t border-gray-200 pt-6 dark:border-gray-700'>
              <DetailedErrorBoundary>
                {syncType === 'gsheet' ? (
                  <GsheetTrigger />
                ) : syncType === 'presigned-csv' ? (
                  <PresignedCsvTrigger />
                ) : (
                  <div>Something went wrong</div>
                )}
              </DetailedErrorBoundary>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
const RadioButton = ({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) => (
  <div onClick={onChange} className='group flex cursor-pointer items-center py-3'>
    <div
      className={classNames(
        'h-4 w-4 rounded-full border transition-colors duration-200',
        'flex items-center justify-center',
        checked
          ? 'border-blue-600 bg-blue-600 dark:border-blue-500 dark:bg-blue-500'
          : 'border-gray-300 group-hover:border-gray-400 dark:border-gray-600 dark:group-hover:border-gray-500'
      )}
    >
      <div
        className={classNames(
          'h-1.5 w-1.5 transform rounded-full bg-white transition-transform duration-200',
          checked ? 'scale-100' : 'scale-0'
        )}
      />
    </div>
    <label
      className={classNames(
        'ms-3 text-sm transition-colors duration-200',
        checked
          ? 'text-gray-900 dark:text-white'
          : 'text-gray-600 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-gray-200'
      )}
    >
      {label}
    </label>
  </div>
);

const SyncSelector = ({
  value,
  onChange,
}: {
  onChange: (p: SyncType) => void;
  value?: SyncType;
}) => {
  return (
    <div>
      <RadioButton
        checked={value === 'gsheet'}
        onChange={() => onChange('gsheet')}
        label='Google Tracking Sheet'
      />
      <RadioButton
        checked={value === 'presigned-csv'}
        onChange={() => onChange('presigned-csv')}
        label='Presigned CSV file'
      />
    </div>
  );
};

const SuccessTriggerWrapper = ({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose?: () => void;
}) => (
  <div className='relative rounded-lg bg-green-50 p-4 text-green-800 dark:bg-green-900/20 dark:text-green-300'>
    <div className='flex items-center justify-between'>
      <div className='flex-1'>{children}</div>
      {onClose && (
        <button
          onClick={onClose}
          className='text-green-600 transition-colors hover:text-green-800 dark:text-green-400 dark:hover:text-green-200'
        >
          <XMarkIcon className='h-5 w-5' />
        </button>
      )}
    </div>
    <div className='mt-2 text-xs text-green-600 italic dark:text-green-400'>
      *sync may take up to 15 minutes
    </div>
  </div>
);

const GsheetTrigger = () => {
  const currentYear = new Date().getFullYear();
  const startYear = 2017;
  const yearsArray = Array.from({ length: currentYear - startYear + 1 }, (_, i) => currentYear - i);
  const [yearSelected, setYearSelected] = useState(currentYear);

  const { data, isPending, isError, isSuccess, error, mutate, reset } = useMutationSyncGsheet({
    body: { year: yearSelected },
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
        {data}
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

const PresignedCsvTrigger = () => {
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
        {data}
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
