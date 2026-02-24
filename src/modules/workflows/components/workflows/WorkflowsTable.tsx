import { useWorkflowModel } from '@/api/workflow';
import { useMemo, useCallback } from 'react';
import { Table, TableData } from '@/components/tables';
import { Badge } from '@/components/common/badges';
import { DEFAULT_PAGE_SIZE } from '@/utils/constant';
import { useQueryParams } from '@/hooks/useQueryParams';
import { RedirectLink } from '@/components/common/link';
import { EyeIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline';
import { Tooltip } from '@/components/common/tooltips';
import { classNames } from '@/utils/commonUtils';
import toaster from '@/components/common/toaster';
import WorkflowTypeDetailsDrawer from './WorkflowTypeDetailsDrawer';
import { WorkflowListModel, WorkflowModel } from '@/api/workflow';

const DRAWER_QUERY_PARAM = 'workflowTypeId';

const WorkflowsTable = () => {
  const { setQueryParams, getPaginationParams, getQueryParams } = useQueryParams();

  const openDrawer = useCallback(
    (workflowTypeId: string) => {
      const current = getQueryParams();
      setQueryParams({
        [DRAWER_QUERY_PARAM]: workflowTypeId,
        ...current,
      });
    },
    [getQueryParams, setQueryParams]
  );

  const closeDrawer = useCallback(() => {
    const current = getQueryParams();
    const rest = { ...current };
    delete rest[DRAWER_QUERY_PARAM];
    setQueryParams(rest, true);
  }, [getQueryParams, setQueryParams]);
  const selectedWorkflowTypeId = (getQueryParams()[DRAWER_QUERY_PARAM] as string) || null;

  const { data: workflowData, isFetching: isFetchingWorkflowsData } = useWorkflowModel({
    params: {
      query: {
        search: getQueryParams().search || '',
        page: getQueryParams().page || 1,
        rowsPerPage: getPaginationParams().rowsPerPage || DEFAULT_PAGE_SIZE,
      },
    },
  });

  const selectedWorkflowTypeDetails = workflowData?.results.find(
    (workflow: { orcabusId: string }) => workflow.orcabusId === selectedWorkflowTypeId
  );

  const column = useMemo(
    () => [
      {
        header: 'Name',
        accessor: 'name',
        cell: (name: unknown, workflowRowData: TableData) => {
          const historyIds =
            (workflowRowData as WorkflowListModel)?.history?.map(
              (workflow: WorkflowModel) => workflow.orcabusId
            ) ?? [];
          const ids = Array.isArray(historyIds) ? historyIds : [historyIds];
          const params = new URLSearchParams();
          ids
            .filter((id): id is string => Boolean(id))
            .forEach((id) => params.append('workflowTypeId', String(id)));
          const queryString = params.toString();
          const to = queryString
            ? `/workflows/workflowRuns?${queryString}`
            : '/workflows/workflowRuns';

          return !name ? (
            <div>-</div>
          ) : (
            <RedirectLink to={to} className='flex items-center p-1'>
              <div>{name as string}</div>
            </RedirectLink>
          );
        },
      },
      {
        header: 'Version',
        accessor: 'version',
        cell: (version: unknown) => {
          if (!version) {
            return <div>-</div>;
          } else {
            return <div>{version as string}</div>;
          }
        },
      },
      {
        header: 'Code Version',
        accessor: 'codeVersion',
        cell: (codeVersion: unknown) => {
          if (!codeVersion) {
            return <div>-</div>;
          } else {
            return <div>{codeVersion as string}</div>;
          }
        },
      },
      {
        header: 'Execution Engine',
        accessor: 'executionEngine',
        cell: (executionEngine: unknown) => {
          if (!executionEngine) {
            return <div>-</div>;
          } else {
            return <div>{executionEngine as string}</div>;
          }
        },
      },
      {
        header: 'Execution Engine Pipeline ID',
        accessor: 'executionEnginePipelineId',
        cell: (executionEnginePipelineId: unknown) => {
          if (!executionEnginePipelineId) {
            return <div>-</div>;
          } else {
            return <div>{executionEnginePipelineId as string}</div>;
          }
        },
      },
      {
        header: 'Validation State',
        accessor: 'validationState',
        cell: (validationState: unknown) => {
          return <Badge status={validationState as string}>{validationState as string}</Badge>;
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
                <DocumentDuplicateIcon
                  className={classNames(
                    'h-4 w-4 cursor-pointer',
                    'text-gray-400 dark:text-gray-500',
                    'transition-all duration-200',
                    'hover:text-gray-600 dark:hover:text-gray-300'
                  )}
                  onClick={() => {
                    navigator.clipboard.writeText(orcabusId as string);
                    toaster.success({
                      title: `Copied orcabusId to clipboard`,
                    });
                  }}
                />
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
        tableData={workflowData?.results ?? []}
        inCard={true}
        isFetchingData={isFetchingWorkflowsData}
        paginationProps={{
          totalCount: workflowData?.pagination?.count ?? 0,
          rowsPerPage: workflowData?.pagination?.rowsPerPage ?? DEFAULT_PAGE_SIZE,
          currentPage: workflowData?.pagination?.page ?? 0,
          setPage: (n: number) => {
            setQueryParams({ page: n });
          },
          setRowsPerPage: (n: number) => {
            setQueryParams({ rowsPerPage: n });
          },
          countUnit: 'workflows',
        }}
      />
      <WorkflowTypeDetailsDrawer
        workflowTypeDetails={selectedWorkflowTypeDetails ?? undefined}
        onClose={closeDrawer}
      />
    </div>
  );
};

export default WorkflowsTable;
