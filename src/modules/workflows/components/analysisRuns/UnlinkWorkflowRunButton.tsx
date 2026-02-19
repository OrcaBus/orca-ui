import { useState } from 'react';
import { Dialog } from '@/components/common/dialogs';
import { useWorkflowRunDetailUpdateModel } from '@/api/workflow';
import { useQueryClient } from '@tanstack/react-query';
import toaster from '@/components/common/toaster';
import { LinkSlashIcon } from '@heroicons/react/24/outline';
import IconButton from '@/components/common/buttons/IconButton';
import Spinner from '@/components/common/spinner/Spinner';

interface UnlinkWorkflowRunButtonProps {
  workflowRunOrcabusId: string;
  disabled?: boolean;
}

const UnlinkWorkflowRunButton = ({
  workflowRunOrcabusId,
  disabled = false,
}: UnlinkWorkflowRunButtonProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { mutate, isPending, isError, error } = useWorkflowRunDetailUpdateModel({
    params: { path: { orcabusId: workflowRunOrcabusId } },
    body: { analysisRun: null },
    reactQuery: {
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          predicate: (query) =>
            typeof query.queryKey[0] === 'string' && query.queryKey[0].includes('workflowrun'),
        });
        await queryClient.invalidateQueries({
          predicate: (query) =>
            typeof query.queryKey[0] === 'string' && query.queryKey[0].includes('analysisrun'),
        });
        toaster.success({ title: 'Workflow run unlinked' });
        setIsDialogOpen(false);
      },
    },
  });

  if (isPending) {
    return (
      <span className='inline-flex items-center'>
        <Spinner size='small' className='h-4 w-4 text-red-500' />
      </span>
    );
  }

  if (isError) {
    throw error;
  }

  return (
    <>
      <IconButton
        icon={
          <LinkSlashIcon className='h-4 w-4 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300' />
        }
        onClick={(e) => {
          e.stopPropagation();
          setIsDialogOpen(true);
        }}
        disabled={disabled}
        hasTooltip
        tooltipText='Unlink workflow run'
        className='text-red-500 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20 dark:hover:text-red-300'
      />
      <Dialog
        open={isDialogOpen}
        size='sm'
        title='Unlink workflow run?'
        content={
          <p className='text-sm text-gray-600 dark:text-gray-400'>
            This removes the workflow run from this analysis run. This can&apos;t be undone.
          </p>
        }
        onClose={() => setIsDialogOpen(false)}
        closeBtn={{ label: 'Cancel', onClick: () => setIsDialogOpen(false) }}
        confirmBtn={{
          label: 'Unlink',
          className:
            'text-white bg-red-600 hover:bg-red-700 focus:ring-red-500 dark:bg-red-500 dark:hover:bg-red-600',
          onClick: () => mutate(),
        }}
      />
    </>
  );
};

export default UnlinkWorkflowRunButton;
