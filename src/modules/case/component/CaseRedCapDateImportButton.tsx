import { Button } from '@/components/common/buttons';
import { ArrowDownOnSquareIcon } from '@heroicons/react/24/outline';
import { Dialog } from '@/components/common/dialogs';
import { useState } from 'react';
import { useMutationCaseSyncFromRedcap } from '@/api/case';
import toaster from '@/components/common/toaster';
import { SpinnerWithText } from '@/components/common/spinner';
import { DateSinglePicker } from '@/components/common/datepicker';
import dayjs from 'dayjs';
import { useQueryClient } from '@tanstack/react-query';

function CaseRedCapDateImportButton() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [afterDate, setAfterDate] = useState<string | null>(null);
  const [beforeDate, setBeforeDate] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { isPending, isError, error, mutate } = useMutationCaseSyncFromRedcap({
    reactQuery: {
      onSuccess: async () => {
        toaster.success({
          title: 'REDCap Import Started',
          message:
            'REDCap import has been triggered. Please refresh the page to see the imported cases.',
        });
        setIsDialogOpen(false);
        await queryClient.invalidateQueries();
      },
    },
  });

  if (isError) {
    throw error;
  }

  const handleClose = () => {
    setIsDialogOpen(false);
    setAfterDate(null);
    setBeforeDate(null);
  };
  return (
    <>
      <Button
        onClick={() => setIsDialogOpen(true)}
        type='primary'
        size='sm'
        className='shadow-sm transition-shadow duration-200 hover:shadow-md'
        disabled={isPending}
      >
        {isPending ? (
          <SpinnerWithText text='Importing...' className='flex-row' />
        ) : (
          <>
            <ArrowDownOnSquareIcon className='h-5 w-5' />
            {'Import from REDCap'}
          </>
        )}
      </Button>

      <Dialog
        open={isDialogOpen}
        size='lg'
        title='Import from REDCap'
        TitleIcon={ArrowDownOnSquareIcon}
        description='Select a date range to import cases from REDCap. Only records submitted within this range will be synced.'
        content={
          <div className='h-100 space-y-4 p-4'>
            <div className='space-y-1'>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
                Get records after this date
              </label>
              <DateSinglePicker
                selectedDate={afterDate}
                onDateChange={(date) => setAfterDate(date)}
                maxDate={new Date()}
              />
            </div>
            <div className='space-y-1'>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
                Get records before this date (optional)
              </label>
              <DateSinglePicker
                selectedDate={beforeDate}
                onDateChange={(date) => setBeforeDate(date)}
                maxDate={new Date()}
              />
            </div>
          </div>
        }
        onClose={handleClose}
        closeBtn={{
          label: 'Cancel',
          onClick: handleClose,
        }}
        confirmBtn={{
          label: 'Import',
          onClick: () =>
            mutate({
              afterDate: dayjs(afterDate).format('YYYY-MM-DD'),
              beforeDate: beforeDate ? dayjs(beforeDate).format('YYYY-MM-DD') : null,
            }),
        }}
      />
    </>
  );
}

export default CaseRedCapDateImportButton;
