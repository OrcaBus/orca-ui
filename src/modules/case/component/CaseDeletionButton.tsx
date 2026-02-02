import { Button } from '@/components/common/buttons';
import { TrashIcon } from '@heroicons/react/24/outline';
import { Dialog } from '@/components/common/dialogs';
import { useState } from 'react';
import { useMutationCaseDelete } from '@/api/case';
import toaster from '@/components/common/toaster';
import { SpinnerWithText } from '@/components/common/spinner';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

function CaseDeletionButton({ caseOrcabusId }: { caseOrcabusId: string }) {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const navigate = useNavigate();

  const { isPending, isError, error, mutate } = useMutationCaseDelete({
    orcabusId: caseOrcabusId,
    reactQuery: {
      onSuccess: async () => {
        toaster.success({
          title: 'Case Deleted!',
          message: `Case ${caseOrcabusId} has been successfully deleted.`,
        });
        await queryClient.invalidateQueries();
        navigate(`../`);
      },
    },
  });

  if (isPending) {
    return <SpinnerWithText text='Deleting case ...' />;
  }

  if (isError) {
    throw error;
  }

  return (
    <>
      <Button onClick={() => setIsDialogOpen(true)} type='red' size='sm'>
        <TrashIcon className='h-5 w-5' />
        Delete
      </Button>

      <Dialog
        open={isDialogOpen}
        size='md'
        title='Delete Case'
        TitleIcon={TrashIcon}
        description='Are you sure you want to delete this case? This action cannot be undone.'
        content={
          <div className='space-y-4 p-4'>
            <p className='text-sm text-gray-700 dark:text-gray-300'>
              This will permanently remove the case and all associated data.
            </p>
          </div>
        }
        onClose={() => setIsDialogOpen(false)}
        closeBtn={{
          label: 'Cancel',
          onClick: () => setIsDialogOpen(false),
        }}
        confirmBtn={{
          label: 'Delete',
          onClick: () => {
            mutate();
            setIsDialogOpen(false);
          },
          className: 'bg-red-600 text-white hover:bg-red-700',
        }}
      />
    </>
  );
}

export default CaseDeletionButton;
