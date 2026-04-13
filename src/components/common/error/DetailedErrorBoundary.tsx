import { XMarkIcon } from '@heroicons/react/24/solid';
import { PropsWithChildren } from 'react';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';

type ErrorBoundaryProps = PropsWithChildren & { errorTitle?: string; onCloseError?: () => void };

const DetailedErrorBoundary = ({ children, errorTitle, onCloseError }: ErrorBoundaryProps) => {
  function Fallback({ error, resetErrorBoundary }: FallbackProps) {
    return (
      <div className='relative my-4 w-full rounded-lg border border-red-100 bg-white p-6 shadow-xs dark:border-red-900 dark:bg-gray-800'>
        <div className='mb-4 flex w-full items-center justify-between'>
          <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
            {errorTitle ?? 'An error occurred'}
          </h3>
          <button
            type='button'
            className='rounded-full p-1 text-gray-400 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-500 focus:ring-2 focus:ring-red-500 focus:outline-hidden dark:text-gray-500 dark:hover:bg-gray-700 dark:hover:text-gray-400 dark:focus:ring-red-400'
            onClick={() => {
              resetErrorBoundary();
              if (onCloseError) onCloseError();
            }}
          >
            <span className='sr-only'>Dismiss error</span>
            <XMarkIcon className='h-5 w-5' aria-hidden='true' />
          </button>
        </div>
        <div className='rounded-md bg-red-50 p-4 dark:bg-red-900/10'>
          <pre className='font-mono text-sm break-words whitespace-pre-wrap text-red-600 dark:text-red-400'>
            {error instanceof Error ? error.message : String(error as Error)}
          </pre>
        </div>
      </div>
    );
  }

  return <ErrorBoundary FallbackComponent={Fallback}>{children}</ErrorBoundary>;
};

export default DetailedErrorBoundary;
