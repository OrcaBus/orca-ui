import { FC, useMemo } from 'react';
import { SideDrawer } from '@/components/common/drawers';
import { classNames, sleep } from '@/utils/commonUtils';
import { Badge } from '@/components/common/badges';
import { Table, Column, TableData } from '@/components/tables';
import type { AnalysisModel } from '@/api/workflow';

interface AnalysisTypeDetailsDrawerProps {
  analysisDetails: AnalysisModel | undefined;
  onClose?: () => void;
}

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
    <div className='text-sm font-medium text-gray-900 dark:text-gray-100'>{value}</div>
  </div>
);

const AnalysisTypeDetailsDrawer: FC<AnalysisTypeDetailsDrawerProps> = ({
  analysisDetails,
  onClose,
}) => {
  const isOpen = !!analysisDetails;

  const contextColumns: Column[] = useMemo(
    () => [
      {
        header: 'Name',
        accessor: 'name',
        cell: (name: unknown) => <span className='font-medium'>{(name as string) || '-'}</span>,
      },
      {
        header: 'Usecase',
        accessor: 'usecase',
        cell: (usecase: unknown) => <span className='text-sm'>{(usecase as string) || '-'}</span>,
      },
      {
        header: 'Description',
        accessor: 'description',
        cell: (description: unknown) => (
          <span className='max-w-[200px] truncate text-sm' title={(description as string) || ''}>
            {(description as string) || '-'}
          </span>
        ),
      },
      {
        header: 'Status',
        accessor: 'status',
        cell: (status: unknown) => (
          <Badge status={(status as string) || 'unknown'}>{(status as string) || '-'}</Badge>
        ),
      },
    ],
    []
  );

  const workflowColumns: Column[] = useMemo(
    () => [
      {
        header: 'Name',
        accessor: 'name',
        cell: (name: unknown) => <span className='font-medium'>{(name as string) || '-'}</span>,
      },
      {
        header: 'Version',
        accessor: 'version',
        cell: (version: unknown) => <span>{(version as string) || '-'}</span>,
      },
      {
        header: 'Code Version',
        accessor: 'codeVersion',
        cell: (codeVersion: unknown) => (
          <span className='font-mono text-xs'>{(codeVersion as string) || '-'}</span>
        ),
      },
      {
        header: 'Execution Engine',
        accessor: 'executionEngine',
        cell: (executionEngine: unknown) => (
          <Badge status={executionEngine as string}>{executionEngine as string}</Badge>
        ),
      },
      {
        header: 'Pipeline ID',
        accessor: 'executionEnginePipelineId',
        cell: (executionEnginePipelineId: unknown) => (
          <span className='font-mono text-xs'>{(executionEnginePipelineId as string) || '-'}</span>
        ),
      },
      {
        header: 'Validation',
        accessor: 'validationState',
        cell: (validationState: unknown) =>
          validationState ? (
            <Badge status={validationState as string}>{validationState as string}</Badge>
          ) : (
            <span className='text-gray-500 dark:text-gray-400'>-</span>
          ),
      },
    ],
    []
  );

  const handleClose = () => {
    sleep(300).then(() => {
      onClose?.();
    });
  };

  const contexts = analysisDetails?.contexts ?? [];
  const workflows = analysisDetails?.workflows ?? [];
  const versionDisplay = analysisDetails?.analysisVersion
    ? `v${analysisDetails.analysisVersion}`
    : '';

  return (
    <SideDrawer
      title={`Analysis Details – ${analysisDetails?.analysisName ?? ''} ${versionDisplay}`.trim()}
      isOpen={isOpen}
      onClose={handleClose}
      size='large'
    >
      <div className='flex h-full flex-col gap-6 overflow-y-auto'>
        {/* Analysis Details Section */}
        <div>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <InfoRow label='Name' value={analysisDetails?.analysisName ?? '-'} />
            <InfoRow label='Version' value={versionDisplay || '-'} />
          </div>
          <div className='mt-4 space-y-4'>
            <InfoRow
              label='Status'
              value={
                analysisDetails?.status ? (
                  <Badge status={analysisDetails.status}>{analysisDetails.status}</Badge>
                ) : (
                  '-'
                )
              }
            />
            <InfoRow label='Description' value={analysisDetails?.description ?? '-'} />
          </div>
        </div>

        {/* Contexts Table */}
        <div>
          <h3 className='mb-3 text-sm font-semibold tracking-wider text-gray-700 uppercase dark:text-gray-300'>
            Contexts ({contexts.length})
          </h3>
          <div
            className={classNames(
              'overflow-hidden rounded-lg shadow-sm ring-1 ring-black/5 dark:ring-white/10'
            )}
          >
            <Table
              columns={contextColumns}
              tableData={contexts as unknown as TableData[]}
              inCard={false}
              isFetchingData={false}
            />
          </div>
        </div>

        {/* Workflows Table */}
        <div>
          <h3 className='mb-3 text-sm font-semibold tracking-wider text-gray-700 uppercase dark:text-gray-300'>
            Workflows ({workflows.length})
          </h3>
          <div
            className={classNames(
              'overflow-hidden rounded-lg shadow-sm ring-1 ring-black/5 dark:ring-white/10'
            )}
          >
            <Table
              columns={workflowColumns}
              tableData={workflows as unknown as TableData[]}
              inCard={false}
              isFetchingData={false}
            />
          </div>
        </div>
      </div>
    </SideDrawer>
  );
};

export default AnalysisTypeDetailsDrawer;
