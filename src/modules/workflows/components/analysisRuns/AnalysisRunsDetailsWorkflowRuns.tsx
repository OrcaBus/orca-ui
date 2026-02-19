import { useMemo, useState } from 'react';
import { Table, Column, TableData } from '@/components/tables';
import { keepPreviousData } from '@tanstack/react-query';
import { dayjs, TIMESTAMP_FORMAT } from '@/utils/dayjs';
import { Badge } from '@/components/common/badges';
import { DEFAULT_PAGE_SIZE } from '@/utils/constant';
import { useQueryParams } from '@/hooks/useQueryParams';
import { useWorkflowRunListModel } from '@/api/workflow';
import { useAnalysisRunsContext } from './AnalysisRunsContext';
import { RedirectLink } from '@/components/common/link';
import { ClipboardDocumentIcon, PlusIcon } from '@heroicons/react/24/outline';
import toaster from '@/components/common/toaster';
import { Tooltip } from '@/components/common/tooltips';
import { Button } from '@/components/common/buttons';
import UnlinkWorkflowRunButton from './UnlinkWorkflowRunButton';
import AddWorkflowRunModal from './AddWorkflowRunModal';

const AnalysisRunsDetailsWorkflowRuns = () => {
  const { analysisRunDetail, workflowRunsCount } = useAnalysisRunsContext();
  const { setQueryParams, getPaginationParams, getQueryParams } = useQueryParams();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const { data: workflowRunsData, isFetching } = useWorkflowRunListModel({
    params: {
      query: {
        analysisRun: analysisRunDetail?.orcabusId ?? undefined,
        page: getQueryParams().page || 1,
        rowsPerPage: getPaginationParams().rowsPerPage || DEFAULT_PAGE_SIZE,
        ordering: getQueryParams().orderBy || '-timestamp',
      },
    },
    reactQuery: {
      enabled: !!analysisRunDetail?.orcabusId,
      placeholderData: keepPreviousData,
    },
  });

  const columns: Column[] = useMemo(
    () => [
      {
        header: 'Run Name',
        accessor: 'workflowRunName',
        cell: (workflowRunName: unknown, rowData: TableData) => {
          const id = rowData.orcabusId;
          const name = (workflowRunName as string) || '-';
          return <RedirectLink to={`/workflows/${id}`}>{name}</RedirectLink>;
        },
      },
      {
        header: 'Portal Run ID',
        accessor: 'portalRunId',
        copyable: true,
        cell: (portalRunId: unknown) => (portalRunId as string) || '-',
      },
      {
        header: 'Execution ID',
        accessor: 'executionId',
        cell: (executionId: unknown) => {
          const value = (executionId as string) || '-';
          return (
            <div className='group inline-flex items-center gap-2'>
              <span>{value}</span>
              {value !== '-' && (
                <Tooltip text='Copy to clipboard' size='small' background='light'>
                  <button
                    type='button'
                    onClick={(e) => {
                      e.stopPropagation();
                      navigator.clipboard.writeText(value);
                      toaster.success({ title: 'Copied to clipboard' });
                    }}
                    className='rounded p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300'
                  >
                    <ClipboardDocumentIcon className='h-4 w-4' />
                  </button>
                </Tooltip>
              )}
            </div>
          );
        },
      },
      {
        header: 'Status',
        accessor: 'currentState',
        cell: (currentState: unknown) => {
          const status = (currentState as { status?: string })?.status || 'unknown';
          return <Badge status={status}>{status.toLowerCase()}</Badge>;
        },
      },
      {
        header: 'Last Modified',
        accessor: 'currentState',
        cell: (currentState: unknown) => {
          const timestamp = (currentState as { timestamp?: string })?.timestamp;
          return timestamp ? dayjs(timestamp).format(TIMESTAMP_FORMAT) : '-';
        },
      },
      {
        header: 'Actions',
        accessor: 'orcabusId',
        cell: (_: unknown, rowData: TableData) => (
          <UnlinkWorkflowRunButton workflowRunOrcabusId={rowData.orcabusId as string} />
        ),
      },
    ],
    []
  );

  return (
    <div className='mt-4'>
      <div className='mb-4 flex items-center justify-between'>
        <p className='text-sm text-gray-500 dark:text-gray-400'>{workflowRunsCount} rows</p>
        <Button
          onClick={() => setIsAddModalOpen(true)}
          type='primary'
          size='md'
          className='shadow-sm'
        >
          <PlusIcon className='h-5 w-5' />
          Add Workflow Run
        </Button>
      </div>
      <Table
        columns={columns}
        tableData={workflowRunsData?.results ?? []}
        inCard={true}
        isFetchingData={isFetching}
        emptyMessage='No workflow runs linked yet. Add workflow runs to associate them with this analysis run.'
        paginationProps={{
          totalCount: workflowRunsData?.pagination?.count ?? 0,
          rowsPerPage: workflowRunsData?.pagination?.rowsPerPage ?? DEFAULT_PAGE_SIZE,
          currentPage: workflowRunsData?.pagination?.page ?? 0,
          setPage: (n: number) => setQueryParams({ page: n }),
          setRowsPerPage: (n: number) => setQueryParams({ rowsPerPage: n }),
          countUnit: 'rows',
        }}
      />
      {analysisRunDetail?.orcabusId && (
        <AddWorkflowRunModal
          open={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          analysisRunOrcabusId={analysisRunDetail.orcabusId}
        />
      )}
    </div>
  );
};

export default AnalysisRunsDetailsWorkflowRuns;
