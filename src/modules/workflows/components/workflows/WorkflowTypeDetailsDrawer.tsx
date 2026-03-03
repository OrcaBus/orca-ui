import { FC, useMemo } from 'react';
import { SideDrawer } from '@/components/common/drawers';
import { classNames, sleep } from '@/utils/commonUtils';
import { Badge } from '@/components/common/badges';
import { Table, Column, TableData } from '@/components/tables';
import type { WorkflowListModel } from '@/api/workflow';

export interface WorkflowTypeHistoryItem {
  orcabusId: string;
  name: string;
  version: string;
  codeVersion: string;
  executionEngine: string;
  executionEnginePipelineId?: string;
  validationState?: string;
}

interface WorkflowTypeDetailsDrawerProps {
  workflowTypeDetails: WorkflowListModel | undefined;
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

const WorkflowTypeDetailsDrawer: FC<WorkflowTypeDetailsDrawerProps> = ({
  workflowTypeDetails,
  onClose,
}) => {
  const isOpen = !!workflowTypeDetails;

  const historyColumns: Column[] = useMemo(
    () => [
      {
        header: 'Name',
        accessor: 'name',
        cell: (name: unknown) => <span>{(name as string) || '-'}</span>,
      },
      {
        header: 'Version',
        accessor: 'version',
        cell: (version: unknown) => <span>{(version as string) || '-'}</span>,
      },
      {
        header: 'Code Version',
        accessor: 'codeVersion',
        cell: (codeVersion: unknown) => <span>{(codeVersion as string) || '-'}</span>,
      },
      {
        header: 'Execution Engine',
        accessor: 'executionEngine',
        cell: (executionEngine: unknown) => (
          <Badge status={executionEngine as string}>{executionEngine as string}</Badge>
        ),
      },
      {
        header: 'Execution Engine Pipeline ID',
        accessor: 'executionEnginePipelineId',
        cell: (executionEnginePipelineId: unknown) => (
          <span className='font-mono text-xs'>{(executionEnginePipelineId as string) || '-'}</span>
        ),
      },
      {
        header: 'Validation State',
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

  const historyItems = useMemo(() => {
    return workflowTypeDetails?.history ?? [];
  }, [workflowTypeDetails]);

  const versionDisplay = workflowTypeDetails?.version ? `v${workflowTypeDetails.version}` : '';

  return (
    <SideDrawer
      title={`Workflow Details – ${workflowTypeDetails?.name ?? ''} ${versionDisplay}`.trim()}
      isOpen={isOpen}
      onClose={handleClose}
      size='large'
    >
      <div className='flex h-full flex-col gap-6 overflow-y-auto'>
        {/* Workflow Details Section - matches Analysis Details style */}
        <div>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <InfoRow label='Name' value={workflowTypeDetails?.name ?? '-'} />
            <InfoRow label='Version' value={versionDisplay || '-'} />
          </div>
          <div className='mt-4 space-y-4'>
            <InfoRow
              label='Status'
              value={
                workflowTypeDetails?.validationState ? (
                  <Badge status={workflowTypeDetails.validationState}>
                    {workflowTypeDetails.validationState}
                  </Badge>
                ) : (
                  '-'
                )
              }
            />
            <InfoRow
              label='Execution Engine'
              value={
                workflowTypeDetails?.executionEngine ? (
                  <Badge status={workflowTypeDetails.executionEngine}>
                    {workflowTypeDetails.executionEngine}
                  </Badge>
                ) : (
                  '-'
                )
              }
            />
            <InfoRow label='Code Version' value={workflowTypeDetails?.codeVersion ?? '-'} />
            <InfoRow
              label='Execution Engine Pipeline ID'
              value={
                <span className='font-mono text-sm'>
                  {workflowTypeDetails?.executionEnginePipelineId ?? '-'}
                </span>
              }
            />
          </div>
        </div>

        {/* History Section */}
        <div>
          <h3 className='mb-3 text-sm font-semibold tracking-wider text-gray-700 uppercase dark:text-gray-300'>
            History
          </h3>
          <div
            className={classNames(
              'overflow-hidden rounded-lg shadow-sm ring-1 ring-black/5 dark:ring-white/10'
            )}
          >
            <Table
              columns={historyColumns}
              tableData={historyItems as unknown as TableData[]}
              inCard={false}
              isFetchingData={false}
            />
          </div>
        </div>
      </div>
    </SideDrawer>
  );
};

export default WorkflowTypeDetailsDrawer;
