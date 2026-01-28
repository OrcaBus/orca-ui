import { FC, ReactNode, FunctionComponent, SVGProps } from 'react';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle, Description } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { classNames } from '@/utils/commonUtils';

export interface DialogButtonProps {
  label: string;
  onClick: () => void;
  className?: string;
  disabled?: boolean;
}

export interface DialogProps {
  TitleIcon?: FunctionComponent<SVGProps<SVGSVGElement>>;
  title: string | ReactNode;
  description?: string;
  content?: string | ReactNode;
  open: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onClose: () => void;
  closeBtn?: DialogButtonProps;
  confirmBtn?: DialogButtonProps;
  children?: ReactNode;
  className?: string;
}

const SimpleDialog: FC<DialogProps> = ({
  TitleIcon,
  title,
  description,
  content,
  open,
  size = 'md',
  onClose,
  closeBtn,
  confirmBtn,
  children,
  className,
}) => {
  return (
    <Dialog open={open} onClose={onClose} className='relative z-50'>
      <DialogBackdrop
        transition
        className='fixed inset-0 bg-gray-500/75 backdrop-blur-xs transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in dark:bg-gray-900/90'
      />

      <div className='fixed inset-0 z-10 w-screen overflow-y-auto p-4 sm:p-6 md:p-8'>
        <div className='flex min-h-full items-center justify-center'>
          <DialogPanel
            transition
            className={classNames(
              'relative w-full max-w-[calc(100vw-2rem)] transform rounded-xl bg-white shadow-xl ring-1 ring-gray-900/5 transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in',
              size === 'sm' && 'sm:max-w-lg sm:data-closed:translate-y-0 sm:data-closed:scale-95',
              size === 'md' && 'md:max-w-2xl md:data-closed:translate-y-0 md:data-closed:scale-95',
              size === 'lg' && 'lg:max-w-6xl lg:data-closed:translate-y-0 lg:data-closed:scale-95',
              size === 'xl' && 'xl:max-w-7xl xl:data-closed:translate-y-0 xl:data-closed:scale-95',
              'dark:bg-gray-800 dark:ring-white/5',
              className || ''
            )}
          >
            {/* Close button */}
            <div className='absolute top-4 right-4'>
              <button
                type='button'
                onClick={onClose}
                className={classNames(
                  'inline-flex items-center justify-center rounded-md p-1.5',
                  'border border-gray-200 dark:border-gray-700',
                  'bg-white dark:bg-gray-800',
                  'text-gray-500 dark:text-gray-400',
                  'shadow-sm dark:shadow-gray-900/30',
                  'hover:bg-gray-50 dark:hover:bg-gray-700/50',
                  'hover:text-gray-600 dark:hover:text-gray-300',
                  'hover:border-gray-300 dark:hover:border-gray-600',
                  'focus:ring-2 focus:outline-none',
                  'focus:ring-blue-500/30 dark:focus:ring-blue-400/30',
                  'active:bg-gray-100 dark:active:bg-gray-700',
                  'transition-all duration-200'
                )}
              >
                <span className='sr-only'>Close</span>
                <XMarkIcon className='h-5 w-5' />
              </button>
            </div>

            <div className='p-6 dark:bg-gray-800'>
              <div className='flex w-full items-start gap-4'>
                {TitleIcon && (
                  <div
                    className={classNames(
                      'flex h-11 w-11 shrink-0 items-center justify-center',
                      'rounded-lg shadow-sm',
                      'bg-blue-50 dark:bg-blue-500/10',
                      'text-blue-600 dark:text-blue-400',
                      'ring-1 ring-blue-100 dark:ring-blue-500/20',
                      'transition-colors duration-200'
                    )}
                  >
                    <TitleIcon className='h-5 w-5' aria-hidden='true' />
                  </div>
                )}

                <div className='w-full flex-1'>
                  <DialogTitle
                    as='h3'
                    className={classNames(
                      'text-lg leading-6 font-semibold',
                      'text-gray-900 dark:text-gray-100',
                      'tracking-tight'
                    )}
                  >
                    {title}
                  </DialogTitle>

                  {description && (
                    <Description
                      className={classNames(
                        'mt-2 text-sm',
                        'text-gray-600 dark:text-gray-300',
                        'leading-relaxed'
                      )}
                    >
                      {description}
                    </Description>
                  )}

                  {(content || children) && (
                    <div
                      className={classNames(
                        'mt-4',
                        'max-h-[60vh] overflow-auto',
                        'text-sm text-gray-600 dark:text-gray-300',
                        'bg-gray-50/50 dark:bg-gray-800/50',
                        '[&>:first-child]:mt-0 [&>:last-child]:mb-0'
                      )}
                    >
                      {content}
                      {children}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {(closeBtn || confirmBtn) && (
              <div className='flex flex-col-reverse gap-2 border-t border-gray-200 px-6 py-4 sm:flex-row sm:justify-end dark:border-gray-700 dark:bg-gray-800/50'>
                {closeBtn && (
                  <button
                    type='button'
                    onClick={closeBtn.onClick}
                    className={classNames(
                      'inline-flex items-center justify-center rounded-md px-4 py-2',
                      'border border-gray-200 dark:border-gray-700',
                      'bg-white dark:bg-gray-800',
                      'text-gray-700 dark:text-gray-200',
                      'shadow-sm dark:shadow-gray-900/30',
                      'hover:bg-gray-50 dark:hover:bg-gray-700/50',
                      'hover:text-gray-900 dark:hover:text-white',
                      'hover:border-gray-300 dark:hover:border-gray-600',
                      'focus:ring-2 focus:outline-none',
                      'focus:ring-gray-500/30 dark:focus:ring-gray-400/30',
                      'active:bg-gray-100 dark:active:bg-gray-700',
                      'text-sm font-medium',
                      'transition-all duration-200',
                      'disabled:cursor-not-allowed disabled:opacity-50',
                      closeBtn.className || ''
                    )}
                  >
                    {closeBtn.label}
                  </button>
                )}
                {confirmBtn && (
                  <button
                    type='button'
                    onClick={confirmBtn.onClick}
                    disabled={confirmBtn.disabled}
                    className={classNames(
                      'inline-flex items-center justify-center rounded-md px-4 py-2',
                      'text-sm font-medium',
                      'shadow-sm dark:shadow-gray-900/30',
                      'focus:ring-2 focus:outline-none',
                      'transition-all duration-200',
                      confirmBtn.disabled
                        ? [
                            'bg-gray-100 dark:bg-gray-800',
                            'text-gray-400 dark:text-gray-500',
                            'border border-gray-200 dark:border-gray-700',
                            'cursor-not-allowed',
                          ]
                        : [
                            'bg-blue-600 dark:bg-blue-500',
                            'text-white',
                            'border border-blue-600 dark:border-blue-500',
                            'hover:bg-blue-700 dark:hover:bg-blue-600',
                            'hover:border-blue-700 dark:hover:border-blue-600',
                            'focus:ring-blue-500/30 dark:focus:ring-blue-400/30',
                            'active:bg-blue-800 dark:active:bg-blue-700',
                          ],
                      confirmBtn.className || ''
                    )}
                  >
                    {confirmBtn.label}
                  </button>
                )}
              </div>
            )}
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
};

export default SimpleDialog;
