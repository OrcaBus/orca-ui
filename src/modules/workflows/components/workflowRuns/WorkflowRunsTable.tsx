import { useMemo } from 'react';
import { Table, Column, TableData } from '@/components/tables';
import { keepPreviousData } from '@tanstack/react-query';
import { dayjs, TIMESTAMP_FORMAT } from '@/utils/dayjs';
import { Badge } from '@/components/common/badges';
import { DEFAULT_PAGE_SIZE } from '@/utils/constant';
import { useQueryParams } from '@/hooks/useQueryParams';
import { useWorkflowRunListModel } from '@/api/workflow';
import { RedirectLink } from '@/components/common/link';

const WorkflowRunsTable = ({ libraryOrcabusId }: { libraryOrcabusId?: string }) => {
  const { setQueryParams, getPaginationParams, getQueryParams } = useQueryParams();

  // Api call to get workflow runs
  const {
    data: workflowRunsData,
    error,
    isError,
    isFetching,
  } = useWorkflowRunListModel({
    params: {
      query: {
        page: getQueryParams().page || 1,
        rowsPerPage: getPaginationParams().rowsPerPage || DEFAULT_PAGE_SIZE,
        search: getQueryParams().search || undefined,
        workflow__orcabus_id: getQueryParams().workflowTypeId || undefined,
        status: ['succeeded', 'failed', 'aborted', 'resolved', 'deprecated', 'draft'].includes(
          getQueryParams().workflowRunStatus
        )
          ? getQueryParams().workflowRunStatus
          : undefined,
        is_ongoing: getQueryParams().workflowRunStatus == 'ongoing' || undefined,
        start_time: getQueryParams().startDate || undefined,
        end_time: getQueryParams().endDate || undefined,
        libraries__orcabusId: libraryOrcabusId ? libraryOrcabusId : undefined,
        ordering: getQueryParams().orderBy || '-timestamp',
      },
    },
    reactQuery: {
      enabled: true,
      placeholderData: keepPreviousData,
    },
  });

  if (isError) {
    throw error;
  }

  const workflowRunColumn: Column[] = useMemo(
    () => [
      {
        header: 'Workflow Run Name',
        accessor: 'workflowRunName',
        cell: (workflowRunName: unknown, workflowRunRowData: TableData) => {
          const id = workflowRunRowData.orcabusId;
          if (!workflowRunName) {
            return <div>-</div>;
          } else {
            return (
              <RedirectLink to={`/workflows/workflowRuns/${id}`} className='flex items-center p-1'>
                <div>{workflowRunName as string}</div>
              </RedirectLink>
            );
          }
        },
      },
      {
        header: 'Portal Run ID',
        accessor: 'portalRunId',
        copyable: true,
        cell: (portalRunId: unknown) => {
          if (!portalRunId) {
            return <div>-</div>;
          } else {
            return <div>{portalRunId as string}</div>;
          }
        },
      },
      // {
      //   header: 'Workflow Type',
      //   accessor: 'workflow',
      //   cell: (workflow: unknown) => {
      //     if (!workflow) {
      //       return <div>-</div>;
      //     } else {
      //       return <div>{(workflow as { name: string }).name}</div>;
      //     }
      //   },
      // },
      // {
      //   header: 'Workflow Version',
      //   accessor: 'workflow',
      //   cell: (workflow: unknown) => {
      //     if (!workflow) {
      //       return <div>-</div>;
      //     } else {
      //       return <div>{(workflow as { version: string }).version}</div>;
      //     }
      //   },
      // },

      {
        header: 'Status',
        accessor: 'currentState',
        cell: (currentState: unknown) => {
          const status = currentState ? (currentState as { status: string }).status : 'unknown';
          return <Badge status={status || 'unknown'}>{status || 'unknown'}</Badge>;
        },
      },
      {
        header: 'Time Stamp',
        accessor: 'currentState',
        onSort: () => {
          const { orderBy } = getQueryParams();
          setQueryParams({
            orderBy: orderBy
              ? orderBy === 'timestamp'
                ? '-timestamp'
                : 'timestamp'
              : '-timestamp',
          });
        },
        sortDirection:
          getQueryParams().orderBy === '-timestamp'
            ? 'desc'
            : getQueryParams().orderBy === 'timestamp'
              ? 'asc'
              : 'desc',
        cell: (currentState: unknown) => {
          const timestamp = currentState ? (currentState as { timestamp: string }).timestamp : null;
          if (!timestamp) {
            return <div>-</div>;
          } else {
            return <div>{dayjs(timestamp as string).format(TIMESTAMP_FORMAT)}</div>;
          }
        },
      },
    ],
    [getQueryParams, setQueryParams]
  );

  return (
    <div className='mt-4'>
      <Table
        columns={[...workflowRunColumn]}
        tableData={workflowRunsData?.results ?? []}
        inCard={true}
        isFetchingData={isFetching}
        paginationProps={{
          totalCount: workflowRunsData?.pagination?.count ?? 0,
          rowsPerPage: workflowRunsData?.pagination?.rowsPerPage ?? DEFAULT_PAGE_SIZE,
          currentPage: workflowRunsData?.pagination?.page ?? 0,
          setPage: (n: number) => {
            setQueryParams({ page: n });
          },
          setRowsPerPage: (n: number) => {
            setQueryParams({ rowsPerPage: n });
          },
          countUnit: 'workflow runs',
        }}
      />
    </div>
  );
};

export default WorkflowRunsTable;
