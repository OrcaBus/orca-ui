import { useState } from 'react';
import { Dialog } from '@/components/common/dialogs';
import { caseDetailPath, useMutationCaseStateCreate } from '@/api/case';
import toaster from '@/components/common/toaster';
import { useQueryClient } from '@tanstack/react-query';
import { SpinnerWithText } from '@/components/common/spinner';
import SingleSelect, { SelectItems } from '@/components/common/select/SingleSelect';
import { components } from '@/api/types/case';

type StatusEnum = components['schemas']['StatusEnum'];

const STATUS_OPTIONS: SelectItems[] = [
  { value: 'request_received', label: 'Request Received' },
  { value: 'sample_received', label: 'Sample Received' },
  { value: 'library_partially_failed', label: 'Library Partially Failed' },
  { value: 'sequencing_started', label: 'Sequencing Started' },
  { value: 'sequencing_completed', label: 'Sequencing Completed' },
  { value: 'bioinformatics_started', label: 'Bioinformatics Started' },
  { value: 'bioinformatics_completed', label: 'Bioinformatics Completed' },
  { value: 'curation_started', label: 'Curation Started' },
  { value: 'curation_completed', label: 'Curation Completed' },
  { value: 'locked', label: 'Locked' },
  { value: 'unlocked', label: 'Unlocked' },
  { value: 'failed', label: 'Failed' },
  { value: 'completed', label: 'Completed' },
  { value: 'archived', label: 'Archived' },
];

function CaseAddStateButton({ caseOrcabusId }: { caseOrcabusId: string }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selected, setSelected] = useState<SelectItems>(STATUS_OPTIONS[0]);
  const queryClient = useQueryClient();

  const { isPending, isError, error, mutate } = useMutationCaseStateCreate({
    reactQuery: {
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: ['get', caseDetailPath, { params: { path: { orcabusId: caseOrcabusId } } }],
        });
        toaster.success({ title: 'State added' });
        setIsDialogOpen(false);
      },
    },
  });

  if (isPending) {
    return <SpinnerWithText text='Saving ...' />;
  }

  if (isError) {
    throw error;
  }

  return (
    <>
      <button
        className='rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
        onClick={() => setIsDialogOpen(true)}
      >
        + Add State
      </button>

      <Dialog
        open={isDialogOpen}
        size='md'
        title='Add New State'
        content={
          <div className='mx-4 w-full max-w-md bg-white p-6 dark:bg-gray-800'>
            <p className='mb-4 text-sm text-gray-600 dark:text-gray-400'>
              Select the new status to set for this case.
            </p>
            <SingleSelect
              groupLabel='Status'
              value={selected}
              options={STATUS_OPTIONS}
              onChange={setSelected}
            />
          </div>
        }
        onClose={() => setIsDialogOpen(false)}
        closeBtn={{ label: 'Cancel', onClick: () => setIsDialogOpen(false) }}
        confirmBtn={{
          label: 'Add State',
          className:
            'text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600 shadow-md hover:shadow-lg border-none',
          onClick: () => {
            mutate({ status: selected.value as StatusEnum, case: caseOrcabusId });
          },
        }}
      />
    </>
  );
}

export default CaseAddStateButton;
