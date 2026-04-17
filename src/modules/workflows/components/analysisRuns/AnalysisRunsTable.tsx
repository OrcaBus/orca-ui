import { useMemo } from 'react';
import { Table, Column, TableData } from '@/components/tables';
import { useQueryParams } from '@/hooks/useQueryParams';
import { keepPreviousData } from '@tanstack/react-query';
import { DEFAULT_PAGE_SIZE } from '@/utils/constant';
import { Badge } from '@/components/common/badges';
import { useAnalysisRunListModel } from '@/api/workflow';
import { dayjs, TIMESTAMP_FORMAT } from '@/utils/dayjs';
import { RedirectLink } from '@/components/common/link';

const AnalysisRunsTable = () => {
  const { setQueryParams, getPaginationParams, getQueryParams } = useQueryParams();
  const {
    data: analysisRunsData,
    isFetching: isFetchingAnalysisRuns,
    isError,
    error,
  } = useAnalysisRunListModel({
    params: {
      query: {
        page: getQueryParams().page || 1,
        rowsPerPage: getPaginationParams().rowsPerPage || DEFAULT_PAGE_SIZE,
        search: getQueryParams().search || undefined,
        analysis__orcabus_id: getQueryParams().analysisTypeId || undefined,
        start_time: getQueryParams().startDate || undefined,
        end_time: getQueryParams().endDate || undefined,
        status: ['succeeded', 'failed', 'aborted', 'resolved', 'deprecated'].includes(
          getQueryParams().analysisRunStatus
        )
          ? getQueryParams().analysisRunStatus
          : undefined,
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

  const analysisRunColumn: Column[] = useMemo(
    () => [
      {
        header: 'Analysis Run Name',
        accessor: 'analysisRunName',
        cell: (analysisRunName: unknown, analysisRunRowData: TableData) => {
          const id = analysisRunRowData.orcabusId;
          if (!analysisRunName) {
            return <div>-</div>;
          } else {
            return (
              <RedirectLink to={`/workflows/analysisRuns/${id}`} className='flex items-center p-1'>
                <div>{analysisRunName as string}</div>
              </RedirectLink>
            );
          }
        },
      },
      {
        header: 'Analysis',
        accessor: 'analysis',
        cell: (analysis: unknown) => {
          return (
            <div className='flex flex-row items-center'>
              <div>{(analysis as { analysisName: string }).analysisName}</div>
            </div>
          );
        },
      },
      {
        header: 'Status',
        accessor: 'currentState',
        cell: (currentState: unknown) => {
          return (
            <Badge status={(currentState as { status: string }).status || 'unknown'}>
              {(currentState as { status: string }).status || 'unknown'}
            </Badge>
          );
        },
      },
      {
        header: 'Comment',
        accessor: 'comment',
        cell: (comment: unknown) => {
          return <div>{comment as string}</div>;
        },
      },
      {
        header: 'Time Stamp',
        accessor: 'currentState',
        cell: (currentState: unknown) => {
          const timestamp = (currentState as { timestamp: string }).timestamp;
          if (!timestamp) {
            return <div>-</div>;
          } else {
            return <div>{dayjs(timestamp as string).format(TIMESTAMP_FORMAT)}</div>;
          }
        },
      },
      {
        header: 'Linkage',
        accessor: 'libraries',
        cell: (libraries: unknown, analysisRunRowData: TableData) => {
          const librariesLinkageCount = (libraries as { libraryId: string }[])?.length;
          const contextsLinkageCount = (analysisRunRowData?.contexts as { contextId: string }[])
            ?.length;
          const readsetsLinkageCount = (analysisRunRowData?.readsets as { readsetId: string }[])
            ?.length;

          return (
            <div className='flex flex-wrap gap-2'>
              <Badge type='primary'>{librariesLinkageCount ?? 0} libraries</Badge>
              <Badge type='secondary'>{contextsLinkageCount ?? 0} contexts</Badge>
              <Badge type='success'>{readsetsLinkageCount ?? 0} readsets</Badge>
            </div>
          );
        },
      },
    ],
    []
  );

  return (
    <div className='mt-4'>
      <Table
        columns={[...analysisRunColumn]}
        tableData={analysisRunsData?.results ?? []}
        inCard={true}
        isFetchingData={isFetchingAnalysisRuns}
        paginationProps={{
          totalCount: analysisRunsData?.pagination?.count ?? 0,
          rowsPerPage: analysisRunsData?.pagination?.rowsPerPage ?? DEFAULT_PAGE_SIZE,
          currentPage: analysisRunsData?.pagination?.page ?? 0,
          setPage: (n: number) => {
            setQueryParams({ page: n });
          },
          setRowsPerPage: (n: number) => {
            setQueryParams({ rowsPerPage: n });
          },
          countUnit: 'analysis runs',
        }}
      />
    </div>
  );
};

export default AnalysisRunsTable;
