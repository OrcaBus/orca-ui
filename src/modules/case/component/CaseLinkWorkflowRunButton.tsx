import { Column, TableData } from '@/components/tables';
import { dayjs, TIMESTAMP_FORMAT } from '@/utils/dayjs';
import { Badge } from '@/components/common/badges';
import { useWorkflowRunListModel } from '@/api/workflow';
import { RedirectLink } from '@/components/common/link';
import CaseLinkEntityButton from './CaseLinkEntityButton';

const WorkflowRunColumn: Column[] = [
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
];

function CaseLinkWorkflowRunButton({ caseOrcabusId }: { caseOrcabusId: string }) {
  return (
    <CaseLinkEntityButton
      useEntityQuery={useWorkflowRunListModel}
      caseOrcabusId={caseOrcabusId}
      entityName={'Workflow Run'}
      tableSelectionColumn={WorkflowRunColumn}
      processDataBeforeTable={(r) => r}
      extractEntityFromRow={(row: unknown) => {
        const val = row as {
          orcabusId: string;
          portalRunId: string;
          workflowRunName: string;
        };
        return {
          orcabusId: val.orcabusId,
          displayId: val.workflowRunName,
        };
      }}
    />
  );
}

export default CaseLinkWorkflowRunButton;
