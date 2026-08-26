import { Column } from '@/components/tables';
import { dayjs, TIMESTAMP_FORMAT } from '@/utils/dayjs';
import { Badge } from '@/components/common/badges';
import { useSequenceRunListModel } from '@/api/sequenceRun';
import { RedirectLink } from '@/components/common/link';
import CaseLinkEntityButton from './CaseLinkEntityButton';

const SequenceRunColumn: Column[] = [
  {
    header: 'Instrument Run ID',
    accessor: 'instrumentRunId',
    cell: (instrumentRunId: unknown) => {
      if (!instrumentRunId) {
        return <div>-</div>;
      } else {
        return (
          <RedirectLink to={`/sequence/${instrumentRunId}`} className='flex items-center p-1'>
            <div>{instrumentRunId as string}</div>
          </RedirectLink>
        );
      }
    },
  },
  {
    header: 'Experiment Name',
    accessor: 'experimentName',
    cell: (experimentName: unknown) => {
      if (!experimentName) {
        return <div>-</div>;
      } else {
        return <div>{experimentName as string}</div>;
      }
    },
  },
  {
    header: 'Status',
    accessor: 'status',
    cell: (status: unknown) => {
      const statusStr = status ? (status as string) : 'UNKNOWN';
      return <Badge status={statusStr}>{statusStr}</Badge>;
    },
  },
  {
    header: 'Start Time',
    accessor: 'startTime',
    cell: (startTime: unknown) => {
      if (!startTime) {
        return <div>-</div>;
      } else {
        return <div>{dayjs(startTime as string).format(TIMESTAMP_FORMAT)}</div>;
      }
    },
  },
];

function CaseLinkSequenceRunButton({ caseOrcabusId }: { caseOrcabusId: string }) {
  return (
    <CaseLinkEntityButton
      useEntityQuery={useSequenceRunListModel}
      caseOrcabusId={caseOrcabusId}
      entityName={'Sequence Run'}
      tableSelectionColumn={SequenceRunColumn}
      processDataBeforeTable={(r) => r}
      extractEntityFromRow={(row: unknown) => {
        const val = row as {
          orcabusId: string;
          instrumentRunId: string;
        };
        return {
          orcabusId: val.orcabusId,
          displayId: val.instrumentRunId,
        };
      }}
    />
  );
}

export default CaseLinkSequenceRunButton;
