import React, { useState } from 'react';
import { Dialog } from '@/components/common/dialogs';
import { caseDetailPath, useMutationCaseUnlinkEntity } from '@/api/case';
import toaster from '@/components/common/toaster';
import { useQueryClient } from '@tanstack/react-query';
import { SpinnerWithText } from '@/components/common/spinner';

function CaseUnlinkEntityButton({
  entityId,
  entityOrcabusId,
  caseOrcabusId,
}: {
  entityId: string;
  entityOrcabusId: string;
  caseOrcabusId: string;
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { isPending, isError, error, mutate } = useMutationCaseUnlinkEntity({
    caseOrcabusId: caseOrcabusId,
    externalEntityOrcabusId: entityOrcabusId,
    reactQuery: {
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: ['GET', caseDetailPath, { path: { orcabusId: caseOrcabusId } }],
        });
        toaster.success({ title: `'${entityId}' unlinked` });
        setIsDialogOpen(false);
      },
    },
  });

  if (isPending) {
    return <SpinnerWithText text='Saving changes ...' />;
  }

  if (isError) {
    throw error;
  }

  return (
    <>
      <div
        className='ml-2 cursor-pointer text-sm font-medium text-red-500 transition-colors duration-200 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300'
        onClick={() => setIsDialogOpen(true)}
      >
        unlink
      </div>

      <Dialog
        open={isDialogOpen}
        size='md'
        title='Confirm Unlink'
        content={
          <div className='mx-4 w-full max-w-md bg-white p-6 dark:bg-gray-800'>
            <p className='mt-2 text-sm text-gray-600 dark:text-gray-400'>
              Are you sure you want to unlink this entity?
            </p>
            <p className='mt-6 font-mono text-xs text-gray-500'>{entityId}</p>
          </div>
        }
        onClose={() => setIsDialogOpen(false)}
        closeBtn={{ label: 'Cancel', onClick: () => setIsDialogOpen(false) }}
        confirmBtn={{
          label: 'Unlink',
          className:
            'text-white bg-red-600 hover:bg-red-700 focus:ring-red-500 dark:bg-red-500 dark:hover:bg-red-600 shadow-md hover:shadow-lg border-none',
          onClick: () => {
            mutate();
          },
        }}
      />
    </>
  );
}

export default CaseUnlinkEntityButton;
