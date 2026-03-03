import { Link } from 'react-router-dom';
import Skeleton from 'react-loading-skeleton';
import {
  ArrowTopRightOnSquareIcon,
  CubeIcon,
  BookOpenIcon,
  LinkIcon,
} from '@heroicons/react/24/outline';
import { useAnalysisRunsContext } from './AnalysisRunsContext';
import { Badge } from '@/components/common/badges';
import { classNames } from '@/utils/commonUtils';

interface InfoRowProps {
  label: string;
  value: React.ReactNode;
  className?: string;
}

const InfoRow = ({ label, value, className }: InfoRowProps) => (
  <div className={classNames('flex flex-col gap-1', className)}>
    <span className='text-xs font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400'>
      {label}
    </span>
    <div className='text-sm text-gray-900 dark:text-gray-100'>{value}</div>
  </div>
);

const AnalysisRunsDetailsCard = () => {
  const { analysisRunDetail, isFetchingAnalysisRunDetail } = useAnalysisRunsContext();

  if (isFetchingAnalysisRunDetail) {
    return (
      <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
        {[1, 2, 3].map((i) => (
          <div key={i} className='rounded-lg border border-gray-200 p-4 dark:border-gray-700'>
            <Skeleton height={24} className='mb-3' />
            <Skeleton height={60} count={3} />
          </div>
        ))}
      </div>
    );
  }

  if (!analysisRunDetail) {
    return null;
  }

  const status = (analysisRunDetail.currentState as { status?: string })?.status;
  const { analysis, contexts, libraries, readsets } = analysisRunDetail;
  const analysisWithDescription = analysis as {
    analysisName: string;
    analysisVersion: string;
    description?: string | null;
    status?: string;
  };

  return (
    <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
      {/* Analysis Run Panel */}
      <div className='rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800/50'>
        <div className='mb-4 flex items-center gap-2'>
          <CubeIcon className='h-5 w-5 text-gray-500 dark:text-gray-400' />
          <h3 className='font-semibold text-gray-900 dark:text-white'>Analysis Run</h3>
        </div>
        <div className='space-y-4'>
          <InfoRow label='Analysis Run Name' value={analysisRunDetail.analysisRunName} />
          <InfoRow label='Comment' value={analysisRunDetail.comment || '-'} />
          <InfoRow
            label='Status'
            value={
              <Badge status={status || 'unknown'}>{(status || 'unknown').toLowerCase()}</Badge>
            }
          />
        </div>
      </div>

      {/* Analysis Type Panel */}
      <div className='rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800/50'>
        <div className='mb-4 flex items-center gap-2'>
          <BookOpenIcon className='h-5 w-5 text-gray-500 dark:text-gray-400' />
          <h3 className='font-semibold text-gray-900 dark:text-white'>Analysis Type</h3>
        </div>
        <div className='space-y-4'>
          <InfoRow label='Analysis Name' value={analysisWithDescription?.analysisName || '-'} />
          <InfoRow
            label='Analysis Version'
            value={analysisWithDescription?.analysisVersion || '-'}
          />
          <InfoRow label='Description' value={analysisWithDescription?.description || '-'} />
          <InfoRow
            label='Analysis Status'
            value={
              <Badge status={analysisWithDescription?.status || 'unknown'}>
                {(analysisWithDescription?.status || 'unknown').toLowerCase()}
              </Badge>
            }
          />
        </div>
      </div>

      {/* Relationships Panel */}
      <div className='rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800/50'>
        <div className='mb-4 flex items-center gap-2'>
          <LinkIcon className='h-5 w-5 text-gray-500 dark:text-gray-400' />
          <h3 className='font-semibold text-gray-900 dark:text-white'>Relationships</h3>
        </div>
        <div className='space-y-4'>
          <InfoRow
            label='Linked Contexts'
            value={
              contexts?.length > 0 ? (
                <div className='flex flex-wrap gap-2'>
                  {contexts.map((ctx) => (
                    <span
                      key={ctx.orcabusId}
                      className={classNames(
                        'inline-flex items-center gap-1 rounded-full px-2.5 py-1',
                        'bg-purple-100 text-purple-700 ring-1 ring-purple-500/20',
                        'dark:bg-purple-900/30 dark:text-purple-400 dark:ring-purple-500/30',
                        'text-xs font-medium'
                      )}
                    >
                      {ctx.name}
                    </span>
                  ))}
                </div>
              ) : (
                '-'
              )
            }
          />
          <InfoRow
            label='Related Libraries'
            value={
              libraries?.length > 0 ? (
                <div className='flex flex-wrap gap-2'>
                  {libraries.map((lib) => (
                    <Link
                      key={lib.orcabusId}
                      to={`/lab/library/${lib.orcabusId}/overview`}
                      className={classNames(
                        'inline-flex items-center gap-1 rounded-full px-2.5 py-1',
                        'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-500/20',
                        'dark:bg-emerald-900/30 dark:text-emerald-400 dark:ring-emerald-500/30',
                        'text-xs font-medium hover:bg-emerald-200 dark:hover:bg-emerald-900/50'
                      )}
                    >
                      {lib.libraryId}
                      <ArrowTopRightOnSquareIcon className='h-3 w-3' />
                    </Link>
                  ))}
                </div>
              ) : (
                '-'
              )
            }
          />
          <InfoRow
            label='Related Readsets'
            value={
              readsets?.length > 0 ? (
                <span className='text-sm'>{readsets.length} readsets</span>
              ) : (
                '-'
              )
            }
          />
        </div>
      </div>
    </div>
  );
};

export default AnalysisRunsDetailsCard;
