import { Dialog } from '@/components/common/dialogs';
import { useAuthContext } from '@/context/AmplifyAuthContext';
import { Textarea } from '@headlessui/react';
import { classNames } from '@/utils/commonUtils';
import { PlusCircleIcon } from '@heroicons/react/24/outline';
import UserProfileSection from './UserProfileSection';

interface SampleSheetUploadDialogProps {
  instrumentRunId: string;
  isOpenSampleSheetUploadDialog: boolean;
  setIsOpenSampleSheetUploadDialog: (isOpen: boolean) => void;
  comment: string;
  file: File | null;
  setComment: (comment: string) => void;
  setFile: (file: File | null) => void;
  handleUploadSamplesheet: () => void;
}

const SampleSheetUploadDialog = ({
  instrumentRunId,
  isOpenSampleSheetUploadDialog,
  setIsOpenSampleSheetUploadDialog,
  comment,
  file,
  setComment,
  setFile,
  handleUploadSamplesheet,
}: SampleSheetUploadDialogProps) => {
  const { user } = useAuthContext();

  const handleClose = () => {
    setComment('');
    setFile(null);
    setIsOpenSampleSheetUploadDialog(false);
  };

  return (
    <Dialog
      TitleIcon={PlusCircleIcon}
      open={isOpenSampleSheetUploadDialog}
      title='Upload Sample Sheet'
      content={
        <div className='flex flex-col gap-4 p-2'>
          {/* user profile section */}
          <UserProfileSection user={user} />

          {/* sequence run id */}
          <div className='flex flex-col gap-0'>
            <div className='text-lg font-medium'>{instrumentRunId || ''}</div>

            <div className='flex flex-row gap-2 py-2'>
              <div className='text-xs font-medium'>Upload sample sheet for the sequence run.</div>
            </div>
          </div>

          {/* divider */}
          <div className='h-px bg-gray-200'></div>

          {/* content */}
          <div className='flex flex-col gap-2'>
            {/* Set file */}
            <div className='mt-2 flex flex-row items-center'>
              <div className='flex w-44 flex-row text-sm text-gray-700 dark:text-gray-300'>
                Sample sheet file
              </div>
              <div className='flex w-full flex-wrap'>
                <div className='relative w-full'>
                  <input
                    className={classNames(
                      'block h-10 w-full rounded-lg text-sm',
                      'bg-white dark:bg-gray-800',
                      'border border-gray-300 dark:border-gray-700',
                      'text-gray-900 dark:text-gray-100',
                      'focus:border-blue-500 dark:focus:border-blue-400',
                      'focus:ring-1 focus:ring-blue-500 focus:outline-none dark:focus:ring-blue-400',
                      'transition-colors duration-200',
                      'file:mr-4 file:h-10 file:border-0 file:border-r',
                      'file:border-gray-300 dark:file:border-gray-600',
                      'file:bg-gray-50 dark:file:bg-gray-700',
                      'file:px-4 file:py-2',
                      'file:text-sm file:font-medium',
                      'file:text-gray-700 dark:file:text-gray-300',
                      'hover:file:bg-gray-100 dark:hover:file:bg-gray-600',
                      'cursor-pointer file:cursor-pointer'
                    )}
                    type='file'
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setFile(e.target.files[0]);
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Comment */}

            <div className='flex flex-col gap-2'>
              <label
                htmlFor='comment'
                className='text-sm font-medium text-gray-700 dark:text-gray-300'
              >
                Comment
              </label>
              <Textarea
                id='comment'
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder='Write your comment here...'
                className='min-h-[120px] w-full rounded-lg border border-gray-300 p-3 text-sm text-gray-900 shadow-xs focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100'
              />
              {!comment && (
                <div className='text-xs text-red-500'>
                  Comment is required to upload sample sheet
                </div>
              )}
            </div>
          </div>
        </div>
      }
      onClose={handleClose}
      closeBtn={{
        label: 'Close',
        onClick: handleClose,
      }}
      confirmBtn={{
        label: 'Upload',
        onClick: handleUploadSamplesheet,
        disabled: !file || !comment,
      }}
    ></Dialog>
  );
};

export default SampleSheetUploadDialog;
