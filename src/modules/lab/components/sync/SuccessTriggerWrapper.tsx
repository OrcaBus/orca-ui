import { XMarkIcon } from '@heroicons/react/20/solid';

export const SuccessTriggerWrapper = ({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose?: () => void;
}) => (
  <div className='relative rounded-lg bg-green-50 p-4 text-green-800 dark:bg-green-900/20 dark:text-green-300'>
    <div className='flex items-center justify-between'>
      <div className='flex-1'>{children}</div>
      {onClose && (
        <button
          onClick={onClose}
          className='text-green-600 transition-colors hover:text-green-800 dark:text-green-400 dark:hover:text-green-200'
        >
          <XMarkIcon className='h-5 w-5' />
        </button>
      )}
    </div>
    <div className='mt-2 text-xs text-green-600 italic dark:text-green-400'>
      *sync may take up to 15 minutes
    </div>
  </div>
);
