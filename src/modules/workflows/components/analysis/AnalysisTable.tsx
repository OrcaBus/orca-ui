import { useAnalysisListModel, useAnalysisDetailModel } from '@/api/workflow';
import { useMemo, useCallback } from 'react';
import { Table, TableData } from '@/components/tables';
import { Badge } from '@/components/common/badges';
import { DEFAULT_PAGE_SIZE } from '@/utils/constant';
import { useQueryParams } from '@/hooks/useQueryParams';
import { RedirectLink } from '@/components/common/link';
import { Tooltip } from '@/components/common/tooltips';
import { EyeIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline';
import { classNames } from '@/utils/commonUtils';
import toaster from '@/components/common/toaster';
import AnalysisTypeDetailsDrawer from './AnalysisTypeDetailsDrawer';

const DRAWER_QUERY_PARAM = 'analysisTypeId';

const AnalysisTable = () => {
  const { setQueryParams, getPaginationParams, getQueryParams } = useQueryParams();

  const openDrawer = useCallback(
    (analysisTypeId: string) => {
      const { page, rowsPerPage } = getPaginationParams();
      setQueryParams({
        [DRAWER_QUERY_PARAM]: analysisTypeId,
        page,
        rowsPerPage,
      });
    },
    [getPaginationParams, setQueryParams]
  );

  const closeDrawer = useCallback(() => {
    const current = getQueryParams();
    const rest = { ...current };
    delete rest[DRAWER_QUERY_PARAM];
    setQueryParams(rest, true);
  }, [getQueryParams, setQueryParams]);

  const selectedAnalysisTypeId = (getQueryParams()[DRAWER_QUERY_PARAM] as string) || null;

  const { data: analysisData, isFetching: isFetchingAnalysisData } = useAnalysisListModel({
    params: {
      query: {
        page: getQueryParams().page || 1,
        rowsPerPage: getPaginationParams().rowsPerPage || DEFAULT_PAGE_SIZE,
      },
    },
  });

  const { data: selectedAnalysisDetail } = useAnalysisDetailModel({
    params: { path: { orcabusId: selectedAnalysisTypeId ?? '' } },
    reactQuery: {
      enabled: !!selectedAnalysisTypeId,
    },
  });

  const column = useMemo(
    () => [
      {
        header: 'Name',
        accessor: 'analysisName',
        cell: (analysisName: unknown, analysisRowData: TableData) => {
          const id = analysisRowData.orcabusId;
          return !analysisName ? (
            <div>-</div>
          ) : (
            <RedirectLink
              to={`/workflows?tab=Analysis+Runs&analysisTypeId=${id}`}
              className='flex items-center p-1'
            >
              <div>{analysisName as string}</div>
            </RedirectLink>
          );
        },
      },
      {
        header: 'Analysis Version',
        accessor: 'analysisVersion',
        cell: (analysisVersion: unknown) => {
          if (!analysisVersion) {
            return <div>-</div>;
          } else {
            return <div>{analysisVersion as string}</div>;
          }
        },
      },
      {
        header: 'Status',
        accessor: 'status',
        cell: (status: unknown) => {
          return <Badge status={status as string}>{status as string}</Badge>;
        },
      },
      {
        header: 'description',
        accessor: 'description',
        cell: (description: unknown) => {
          return <div>{description as string}</div>;
        },
      },
      {
        header: 'Linkage',
        accessor: 'contexts',
        cell: (contexts: unknown, analysisRowData: TableData) => {
          const contextsLinkageCount = (contexts as { orcabusId: string }[])?.length;
          const workflowsLinkageCount = (analysisRowData?.workflows as { orcabusId: string }[])
            ?.length;

          return (
            <div className='flex flex-wrap gap-2'>
              <Badge type='secondary'>{contextsLinkageCount ?? 0} contexts</Badge>
              <Badge type='success'>{workflowsLinkageCount ?? 0} workflows</Badge>
            </div>
          );
        },
      },
      {
        header: 'Actions',
        accessor: 'orcabusId',
        cell: (orcabusId: unknown) => {
          const id = orcabusId as string;
          return (
            <div className='group flex flex-row items-center gap-2'>
              <Tooltip text='View Details' size='small' background='light'>
                <button type='button' onClick={() => openDrawer(id)} className='rounded p-0.5'>
                  <EyeIcon
                    className={classNames(
                      'h-4 w-4 cursor-pointer',
                      'text-gray-400 dark:text-gray-500',
                      'transition-all duration-200',
                      'hover:text-gray-600 dark:hover:text-gray-300'
                    )}
                  />
                </button>
              </Tooltip>
              <Tooltip text='Copy id' size='small' background='light'>
                <button
                  type='button'
                  onClick={() => {
                    navigator.clipboard.writeText(id);
                    toaster.success({ title: 'Copied orcabusId to clipboard' });
                  }}
                  className='rounded p-0.5'
                >
                  <DocumentDuplicateIcon
                    className={classNames(
                      'h-4 w-4 cursor-pointer',
                      'text-gray-400 dark:text-gray-500',
                      'transition-all duration-200',
                      'hover:text-gray-600 dark:hover:text-gray-300'
                    )}
                  />
                </button>
              </Tooltip>
            </div>
          );
        },
      },
    ],
    [openDrawer]
  );

  return (
    <div className='mt-4'>
      <Table
        columns={column}
        tableData={analysisData?.results ?? []}
        inCard={true}
        isFetchingData={isFetchingAnalysisData}
        paginationProps={{
          totalCount: analysisData?.pagination?.count ?? 0,
          rowsPerPage: analysisData?.pagination?.rowsPerPage ?? DEFAULT_PAGE_SIZE,
          currentPage: analysisData?.pagination?.page ?? 0,
          setPage: (n: number) => {
            setQueryParams({ page: n });
          },
          setRowsPerPage: (n: number) => {
            setQueryParams({ rowsPerPage: n });
          },
          countUnit: 'analyses',
        }}
      />
      <AnalysisTypeDetailsDrawer
        analysisDetails={selectedAnalysisDetail ?? undefined}
        onClose={closeDrawer}
      />
    </div>
  );
};

export default AnalysisTable;
