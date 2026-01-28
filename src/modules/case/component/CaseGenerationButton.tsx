import { Button } from '@/components/common/buttons';
import { SparklesIcon } from '@heroicons/react/24/outline';
import { Dialog } from '@/components/common/dialogs';
import { useState } from 'react';
import { useMutationCaseGenerate } from '@/api/case';
import toaster from '@/components/common/toaster';
import { SpinnerWithText } from '@/components/common/spinner';

function CaseGenerateButton() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { isPending, isError, error, mutate } = useMutationCaseGenerate({
    reactQuery: {
      onSuccess: async () => {
        toaster.success({
          title: 'Case Generation Started',
          message:
            'Case generation may take up to 15 minutes. Please refresh the page manually to see the new cases.',
        });
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
      <Button
        onClick={() => setIsDialogOpen(true)}
        type='primary'
        size='sm'
        className='shadow-sm transition-shadow duration-200 hover:shadow-md'
      >
        <SparklesIcon className='h-5 w-5' />
        Generate Cases
      </Button>

      <Dialog
        open={isDialogOpen}
        size='lg'
        title='Generate Cases'
        TitleIcon={SparklesIcon}
        description='This will automatically generate new cases based on predefined logic.'
        content={
          <div className='space-y-4 p-4'>
            <p className='text-sm text-gray-600 dark:text-gray-300'>
              The system will analyze existing data and create cases according to configured rules.
            </p>
            {/* TODO: Add configuration options here (date ranges, filters, etc.) */}
          </div>
        }
        onClose={() => setIsDialogOpen(false)}
        closeBtn={{
          label: 'Cancel',
          onClick: () => setIsDialogOpen(false),
        }}
        confirmBtn={{
          label: 'Generate',
          onClick: () => {
            mutate();
            setIsDialogOpen(false);
          },
        }}
      />
    </>
  );
}

export default CaseGenerateButton;
