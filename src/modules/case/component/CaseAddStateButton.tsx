import { useState } from 'react';
import { Dialog } from '@/components/common/dialogs';
import { caseDetailPath, caseStatesPath, useMutationCaseStateCreate } from '@/api/case';
import toaster from '@/components/common/toaster';
import { useQueryClient } from '@tanstack/react-query';
import { SpinnerWithText } from '@/components/common/spinner';
import SingleSelect, { SelectItems } from '@/components/common/select/SingleSelect';
import { components } from '@/api/types/case';

type StatusEnum = components['schemas']['StatusEnum'];

/**
 * Converts a snake_case status value to a human-readable label.
 * e.g. "request_received" -> "request received"
 */
const toLabel = (value: string): string => value.replaceAll('_', ' ');

/**
 * All possible StatusEnum values. TypeScript will enforce that each entry
 * is a valid StatusEnum member, so if the backend API types change,
 * you'll get a compile error here prompting you to update.
 */
const STATUS_VALUES: StatusEnum[] = [
  // 'request_received', // Removing as not curently needed
  'wgts_tumour_sample_received',
  'wgts_germline_sample_received',
  'cttso_sample_received',
  'all_sample_received',
  'library_partially_failed',
  'sequencing_started',
  'sequencing_completed',
  'bioinformatics_started',
  'bioinformatics_completed',
  'curation_started',
  'curation_completed',
  'locked',
  'unlocked',
  'failed',
  'completed',
  'archived',
];

const STATUS_OPTIONS: SelectItems[] = STATUS_VALUES.map((value) => ({
  value,
  label: toLabel(value),
}));

function CaseAddStateButton({ caseOrcabusId }: { caseOrcabusId: string }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selected, setSelected] = useState<SelectItems>(STATUS_OPTIONS[0]);
  const [eventAt, setEventAt] = useState<string>('');
  const queryClient = useQueryClient();

  const { isPending, isError, error, mutate } = useMutationCaseStateCreate({
    reactQuery: {
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: ['get', caseDetailPath, { params: { path: { orcabusId: caseOrcabusId } } }],
        });
        await queryClient.invalidateQueries({
          queryKey: ['get', caseStatesPath, { params: { path: { orcabusId: caseOrcabusId } } }],
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
            <div className='mt-4'>
              <label className='mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300'>
                Event At (optional)
              </label>
              <input
                type='date'
                value={eventAt}
                onChange={(e) => setEventAt(e.target.value)}
                className='w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:focus:border-blue-400'
              />
            </div>
          </div>
        }
        onClose={() => setIsDialogOpen(false)}
        closeBtn={{ label: 'Cancel', onClick: () => setIsDialogOpen(false) }}
        confirmBtn={{
          label: 'Add State',
          className:
            'text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600 shadow-md hover:shadow-lg border-none',
          onClick: () => {
            mutate({
              status: selected.value as StatusEnum,
              case: caseOrcabusId,
              ...(eventAt && { eventAt }),
            });
          },
        }}
      />
    </>
  );
}

export default CaseAddStateButton;
