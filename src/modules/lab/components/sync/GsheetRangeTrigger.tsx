import { useEffect, useState } from 'react';
import { Button } from '@/components/common/buttons';
import { SpinnerWithText } from '@/components/common/spinner';
import { useMutationPreviewGsheetRecords, useMutationSyncGsheet } from '@/api/metadata';
import { classNames } from '@/utils/commonUtils';
import { useQueryParams } from '@/hooks/useQueryParams';
import { Dialog } from '@/components/common/dialogs';
import { EyeIcon } from '@heroicons/react/24/outline';
import { SuccessTriggerWrapper } from './SuccessTriggerWrapper';

const CURRENT_YEAR = new Date().getFullYear();
const START_YEAR = 2017;
const YEARS_ARRAY = Array.from(
  { length: CURRENT_YEAR - START_YEAR + 1 },
  (_, i) => CURRENT_YEAR - i
);
const RANGE_REGEX = /^(\d+(?::\d+)?)(,\s*\d+(?::\d+)?)*$/;

function sanitizeRanges(input: string): string[] {
  // Split by comma, trim, convert single numbers to n:n
  return input.split(',').map((part) => {
    const trimmed = part.trim();
    if (/^\d+$/.test(trimmed)) {
      return `${trimmed}:${trimmed}`;
    }
    return trimmed;
  });
}

export const GsheetRangeTrigger = () => {
  const { getQueryParams, setQueryParams } = useQueryParams();
  const queryParams = getQueryParams();

  const [yearSelected, setYearSelected] = useState<number>(
    Number(queryParams.year) || CURRENT_YEAR
  );
  const [ranges, setRanges] = useState<string>(String(queryParams.ranges || ''));

  const isPreviewOpen = !!queryParams.year && !!queryParams.ranges;
  const isValidRange = RANGE_REGEX.test(ranges.trim());
  const canPreview = ranges.trim() && isValidRange;

  if (isPreviewOpen) {
    return <GsheetRecordPreview />;
  }

  return (
    <div className='space-y-4'>
      <div>
        <label className='block text-sm font-medium text-gray-900 dark:text-white'>Year</label>
        <p className='text-xs text-gray-500 dark:text-gray-400'>
          Select the Google Sheet tab year to sync from
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
          {YEARS_ARRAY.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className='block text-sm font-medium text-gray-900 dark:text-white'>ranges</label>
        <p className='text-xs text-gray-500 dark:text-gray-400'>
          Specify row range(s) using the format:{' '}
          <span className='font-mono font-semibold text-blue-600 dark:text-blue-400'>
            START:END
          </span>{' '}
          or CSV for multiple ranges
        </p>
        <p className='mt-1 text-xs text-gray-500 dark:text-gray-400'>
          Examples: <span className='font-mono font-extrabold'>20:30</span> or{' '}
          <span className='font-mono font-extrabold'>20:30,40:50,60:70</span>
        </p>
        <input
          value={ranges}
          onChange={(e) => setRanges(e.target.value)}
          placeholder='e.g., 20:30 or 20:30,40:50'
          className={classNames(
            'mt-2 block w-full rounded-lg px-3 py-2 text-sm',
            'bg-white dark:bg-gray-800',
            'border',
            ranges && !isValidRange
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500 dark:border-red-400 dark:focus:border-red-400 dark:focus:ring-red-400'
              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:focus:border-blue-400 dark:focus:ring-blue-400',
            'text-gray-900 dark:text-white',
            'placeholder:text-gray-400 dark:placeholder:text-gray-500',
            'transition-colors duration-200'
          )}
        />
        {ranges && !isValidRange && (
          <p className='mt-1 text-xs text-red-600 dark:text-red-400'>
            Invalid format. Use START:END (e.g., 20:30) or CSV for multiple ranges (e.g.,
            20:30,40:50). Single numbers will be auto-converted to n:n.
          </p>
        )}
      </div>

      <Button
        onClick={() => setQueryParams({ year: yearSelected, ranges: ranges.trim() })}
        disabled={!canPreview}
        type='primary'
        size='sm'
        className='!disabled:opacity-50 w-full justify-center gap-2 shadow-sm transition-shadow duration-200 hover:shadow-md disabled:cursor-not-allowed'
      >
        <EyeIcon className='h-5 w-5' />
        Preview Records
      </Button>
    </div>
  );
};

const GsheetRecordPreview = () => {
  const { getQueryParams, setQueryParams } = useQueryParams();
  const queryParams = getQueryParams();

  if (!queryParams.year || !queryParams.ranges) {
    throw new Error('No year and ranges on the query parameter');
  }

  const year = Number(queryParams.year);
  const ranges = String(queryParams.ranges);

  const {
    data: previewData,
    isPending: isPreviewPending,
    isError: isPreviewError,
    error: previewError,
    mutate: fetchPreview,
  } = useMutationPreviewGsheetRecords({
    body: { year, ranges: sanitizeRanges(ranges) },
  });

  const {
    data: syncData,
    isPending: isSyncing,
    isError: isSyncError,
    isSuccess: isSyncSuccess,
    error: syncError,
    mutate: syncRecords,
    reset: resetSync,
  } = useMutationSyncGsheet({
    body: { year, ranges: sanitizeRanges(ranges) },
  });

  useEffect(() => {
    fetchPreview();
  }, [fetchPreview]);

  if (isPreviewError) {
    throw previewError;
  }

  if (isSyncError) {
    throw syncError;
  }

  if (isPreviewPending || !previewData) {
    return (
      <Dialog
        open={true}
        size='lg'
        title='Preview Metadata'
        description='Preview metadata to sync'
        content={
          <div className='flex flex-col items-center justify-center py-8'>
            <SpinnerWithText text='Loading metadata records...' />
          </div>
        }
        onClose={() => false}
      />
    );
  }

  const cancel = () => {
    setQueryParams({ year: undefined, ranges: undefined });
    if (isSyncSuccess) {
      resetSync();
    }
  };

  if (isSyncing) {
    return (
      <Dialog
        open={true}
        size='lg'
        title='Syncing...'
        description='Please wait while we sync the records to metadata.'
        content={
          <div className='flex flex-col items-center justify-center py-8'>
            <SpinnerWithText text='Syncing records to metadata...' />
          </div>
        }
        onClose={() => false}
      />
    );
  }

  if (isSyncSuccess) {
    return (
      <Dialog
        open={true}
        size='lg'
        title='Sync Confirmation'
        content={
          <SuccessTriggerWrapper onClose={cancel}>
            <div className='text-center'>
              <p className='text-sm text-gray-700 dark:text-gray-300'>{syncData}</p>
            </div>
          </SuccessTriggerWrapper>
        }
        onClose={cancel}
        closeBtn={{
          label: 'Close',
          onClick: cancel,
        }}
      />
    );
  }

  const handleConfirm = () => {
    syncRecords();
  };

  const hasData = previewData.columns?.length && previewData.values?.length;
  const recordCount = previewData.values?.length || 0;

  return (
    <Dialog
      open={true}
      size='lg'
      title='Sync Confirmation'
      description={
        hasData
          ? `Found ${recordCount} record(s) in the specified ranges. Review and confirm to sync these records to metadata.`
          : 'No data available to sync.'
      }
      content={
        hasData ? (
          <GsheetPreviewTable columns={previewData.columns} values={previewData.values} />
        ) : (
          <div className='rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-center dark:border-yellow-800 dark:bg-yellow-900/20'>
            <p className='text-sm text-yellow-800 dark:text-yellow-200'>
              No data found for the specified ranges.
            </p>
          </div>
        )
      }
      onClose={cancel}
      closeBtn={{
        className:
          'text-white bg-gray-600 hover:bg-gray-700 focus:ring-gray-500 dark:bg-gray-500 dark:hover:bg-gray-600 shadow-md hover:shadow-lg',
        label: 'Cancel',
        onClick: cancel,
      }}
      confirmBtn={{
        label: 'Confirm & Sync',
        onClick: handleConfirm,
        disabled: !hasData,
        className:
          'text-white bg-green-600 hover:bg-green-700 focus:ring-green-500 dark:bg-green-500 dark:hover:bg-green-600' +
          ' shadow-md hover:shadow-lg',
      }}
    />
  );
};

const GsheetPreviewTable = ({ columns, values }: { columns: string[]; values: string[][] }) => (
  <div className='max-h-96 overflow-auto rounded-lg border border-gray-200 dark:border-gray-700'>
    <table className='min-w-full divide-y divide-gray-200 dark:divide-gray-700'>
      <thead className='sticky top-0 bg-gray-50 dark:bg-gray-800'>
        <tr>
          {columns.map((col, idx) => (
            <th
              key={`${col}-${idx}`}
              className='px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-700 uppercase dark:text-gray-200'
            >
              {col}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className='divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900'>
        {values.map((row, rowIdx) => (
          <tr
            key={rowIdx}
            className='transition-colors duration-150 hover:bg-gray-50 dark:hover:bg-gray-800'
          >
            {row.map((cell, cellIdx) => (
              <td
                key={cellIdx}
                className='px-4 py-3 text-sm whitespace-nowrap text-gray-900 dark:text-gray-100'
              >
                {cell || '-'}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
