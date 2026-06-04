import { Button } from '@/components/common/buttons';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { Dialog } from '@/components/common/dialogs';
import { useState } from 'react';
import { useMutationCaseSyncFromRedcapAuto } from '@/api/case';
import toaster from '@/components/common/toaster';
import { SpinnerWithText } from '@/components/common/spinner';
import { useQueryClient } from '@tanstack/react-query';

function CaseRedCapAutoImportButton() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { isPending, isError, error, mutate } = useMutationCaseSyncFromRedcapAuto({
    reactQuery: {
      onSuccess: async () => {
        toaster.success({
          title: 'REDCap Auto Import Started',
          message:
            'REDCap auto import has been triggered. Please refresh the page to see the imported cases.',
        });
        setIsDialogOpen(false);
        await queryClient.invalidateQueries();
      },
    },
  });

  if (isError) {
    throw error;
  }

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
            <ArrowPathIcon className='h-5 w-5' />
            {'Auto Import from REDCap'}
          </>
        )}
      </Button>

      <Dialog
        open={isDialogOpen}
        size='md'
        title='Auto Import from REDCap'
        TitleIcon={ArrowPathIcon}
        description='This will automatically sync cases from REDCap using the default date range. Do you want to proceed?'
        content={null}
        onClose={() => setIsDialogOpen(false)}
        closeBtn={{
          label: 'Cancel',
          onClick: () => setIsDialogOpen(false),
        }}
        confirmBtn={{
          label: 'Auto Import',
          onClick: () => mutate(),
        }}
      />
    </>
  );
}

export default CaseRedCapAutoImportButton;
