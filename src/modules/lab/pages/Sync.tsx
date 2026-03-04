import { DetailedErrorBoundary } from '@/components/common/error';
import { classNames } from '@/utils/commonUtils';
import { PresignedCsvTrigger } from '../components/sync/PresignedCsvTrigger';
import { GsheetTrigger } from '../components/sync/GsheetTrigger';
import { useQueryParams } from '@/hooks/useQueryParams';
import { Navigate } from 'react-router-dom';
import { GsheetRangeTrigger } from '../components/sync/GsheetRangeTrigger';

type SyncType = 'gsheet' | 'presigned-csv' | 'gsheet-range';

export default function SyncPage() {
  const { getQueryParams, setQueryParams } = useQueryParams();
  const syncType = getQueryParams().syncType as SyncType;

  const setSyncType = (type: SyncType) => setQueryParams({ syncType: type });

  if (!syncType) {
    return <Navigate to='/lab/sync?syncType=gsheet' replace />;
  }

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
              <DetailedErrorBoundary
                onCloseError={() => {
                  setQueryParams({}, true);
                }}
              >
                {syncType === 'gsheet' ? (
                  <GsheetTrigger />
                ) : syncType === 'presigned-csv' ? (
                  <PresignedCsvTrigger />
                ) : (
                  <GsheetRangeTrigger />
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
        checked={value === 'gsheet-range'}
        onChange={() => onChange('gsheet-range')}
        label='Specific range in Google Sheet'
      />
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
