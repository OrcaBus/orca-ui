import Skeleton from 'react-loading-skeleton';
import { ClipboardDocumentIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { useState } from 'react';
import toaster from '@/components/common/toaster';
import { useAnalysisRunsContext } from './AnalysisRunsContext';
import { Badge } from '@/components/common/badges';
import { Tooltip } from '@/components/common/tooltips';
import { classNames } from '@/utils/commonUtils';

const CopyableId = ({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setIsCopied(true);
      toaster.success({ title: 'Copied to clipboard' });
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      toaster.error({ title: 'Failed to copy' });
    }
  };

  return (
    <div className={classNames('flex items-center gap-2 text-sm', className)}>
      <span className='text-gray-500 dark:text-gray-400'>{label}:</span>
      <span className='font-mono text-gray-900 dark:text-gray-100'>{value}</span>
      <Tooltip text={isCopied ? 'Copied!' : 'Copy to clipboard'} size='small' background='light'>
        <button
          type='button'
          onClick={handleCopy}
          className={classNames(
            'rounded p-0.5 transition-colors',
            'hover:bg-gray-100 dark:hover:bg-gray-700',
            'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300'
          )}
        >
          {isCopied ? (
            <CheckCircleIcon className='h-4 w-4 text-emerald-500' />
          ) : (
            <ClipboardDocumentIcon className='h-4 w-4' />
          )}
        </button>
      </Tooltip>
    </div>
  );
};

const AnalysisRunsDetailsHeader = () => {
  const { analysisRunDetail, isFetchingAnalysisRunDetail } = useAnalysisRunsContext();

  if (isFetchingAnalysisRunDetail) {
    return (
      <div className='flex flex-col gap-3 pb-4'>
        <Skeleton height={28} width={300} />
        <Skeleton height={20} width={400} />
      </div>
    );
  }

  if (!analysisRunDetail) {
    return null;
  }

  const status = (analysisRunDetail.currentState as { status?: string })?.status;

  return (
    <div className={classNames('flex w-full flex-col gap-4 pb-4', 'bg-white dark:bg-gray-900')}>
      {/* Title and Status */}
      <div className='flex flex-col gap-3 pt-4'>
        <div className='flex flex-wrap items-center gap-3'>
          <h1 className='truncate text-xl font-semibold text-gray-900 dark:text-white'>
            {analysisRunDetail.analysisRunName}
          </h1>
          <Badge status={status || 'unknown'}>
            <span className='capitalize'>{(status || 'unknown').toLowerCase()}</span>
          </Badge>
        </div>

        {/* IDs */}
        <div className='flex flex-wrap gap-6'>
          <CopyableId label='AnalysisRun Orcabus ID' value={analysisRunDetail.orcabusId} />
        </div>
      </div>
    </div>
  );
};

export default AnalysisRunsDetailsHeader;
