/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState } from 'react';
import { Table, Column, TableData } from '@/components/tables';
import { dayjs, TIMESTAMP_FORMAT } from '@/utils/dayjs';
import { Badge } from '@/components/common/badges';
import { DEFAULT_NON_PAGINATE_PAGE_SIZE } from '@/utils/constant';
import { useWorkflowRunListModel } from '@/api/workflow';
import { RedirectLink } from '@/components/common/link';
import { classNames } from '@/utils/commonUtils';
import CaseUnlinkEntityButton from './CaseUnlinkEntityButton';

const CaseWorkflowRunTable = ({
  externalEntitySet,
  caseOrcabusId,
}: {
  externalEntitySet: Record<string, any>[];
  caseOrcabusId: string;
}) => {
  const [isUnlinking, setIsUnlinking] = useState(false);

  // we want just the wfr_run for this component,
  // we will split this orcabusId map to its full case detail
  const wfrMapCase: Record<string, any> = {};
  externalEntitySet.forEach((o) => {
    if (o.externalEntity.serviceName == 'workflow' && o.externalEntity.type == 'workflow_run') {
      wfrMapCase[o.externalEntity.orcabusId] = { ...o };
    }
  });
  const {
    data: workflowRunsData,
    error,
    isError,
    isFetching,
  } = useWorkflowRunListModel({
    params: {
      query: {
        rowsPerPage: DEFAULT_NON_PAGINATE_PAGE_SIZE,
        orcabusId: Object.keys(wfrMapCase),
      },
    },
    reactQuery: {
      enabled: Object.keys(wfrMapCase).length > 0,
    },
  });

  if (isError) {
    throw error;
  }

  const workflowRunColumn: Column[] = useMemo(
    // eslint-disable-next-line react-hooks/preserve-manual-memoization
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
              <RedirectLink to={`/runs/workflow/${id}`} className='flex items-center p-1'>
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
      {
        header: 'Status',
        accessor: 'currentState',
        cell: (currentState: unknown) => {
          const status = currentState ? (currentState as { status: string }).status : 'unknown';
          return <Badge status={status || 'unknown'}>{status || 'unknown'}</Badge>;
        },
      },
      {
        header: 'Timestamp',
        accessor: 'currentState',
        cell: (currentState: unknown) => {
          const timestamp = currentState ? (currentState as { timestamp: string }).timestamp : null;
          if (!timestamp) {
            return <div>-</div>;
          } else {
            return <div>{dayjs(timestamp as string).format(TIMESTAMP_FORMAT)}</div>;
          }
        },
      },

      {
        header: 'Added via',
        headerClassName: classNames(
          'bg-red-50/90 dark:bg-red-900/40',
          'text-gray-900 dark:text-gray-100',
          'transition-all duration-200'
        ),
        accessor: 'orcabusId',
        cell: (p: unknown) => {
          const rawOrcabusId = (p as string).split('.')[1];
          return <>{wfrMapCase[rawOrcabusId].addedVia ?? '-'}</>;
        },
      },
      {
        header: 'Linked on',
        headerClassName: classNames(
          'bg-red-50/90 dark:bg-red-900/40',
          'text-gray-900 dark:text-gray-100',
          'transition-all duration-200'
        ),
        accessor: 'orcabusId',
        cell: (p: unknown) => {
          const rawOrcabusId = (p as string).split('.')[1];

          return <>{dayjs(wfrMapCase[rawOrcabusId].timestamp).format(TIMESTAMP_FORMAT) ?? '-'}</>;
        },
      },
      {
        header: '',
        headerClassName: classNames(
          'bg-red-50/90 dark:bg-red-900/40',
          'text-gray-900 dark:text-gray-100',
          'transition-all duration-200'
        ),
        accessor: 'orcabusId',
        cell: (p: unknown) => {
          const workflowOrcabusId = (p as string).split('.')[1];
          return (
            <CaseUnlinkEntityButton
              entityId={wfrMapCase[workflowOrcabusId].externalEntity.alias}
              entityOrcabusId={workflowOrcabusId}
              caseOrcabusId={caseOrcabusId}
              disabled={isUnlinking}
              setIsUnlinking={setIsUnlinking}
            />
          );
        },
      },
    ],
    [caseOrcabusId, wfrMapCase]
  );

  return (
    <div className='mt-4'>
      <Table
        columns={[...workflowRunColumn]}
        tableData={workflowRunsData?.results ?? []}
        inCard={true}
        isFetchingData={isFetching}
      />
    </div>
  );
};

export default CaseWorkflowRunTable;
