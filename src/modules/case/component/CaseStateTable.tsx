import { Table } from '@/components/tables';
import { dayjs, TIMESTAMP_FORMAT } from '@/utils/dayjs';
import CaseAddStateButton from './CaseAddStateButton';
import { useQueryCaseStatesObject } from '@/api/case';

const CaseStateTable = ({ caseOrcabusId }: { caseOrcabusId: string }) => {
  const caseStates = useQueryCaseStatesObject({
    params: { path: { orcabusId: caseOrcabusId } },
  });

  const tableData = (caseStates.data?.results ?? []).map((s) => ({
    orcabusId: s.orcabusId,
    status: s.status,
    eventAt: dayjs(s.eventAt).format(TIMESTAMP_FORMAT),
    createdAt: dayjs(s.createdAt).format(TIMESTAMP_FORMAT),
  }));

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex justify-end'>
        <CaseAddStateButton caseOrcabusId={caseOrcabusId} />
      </div>
      <Table
        inCard={false}
        columns={[
          { header: 'Status', accessor: 'status' },
          { header: 'Event At', accessor: 'eventAt' },
          { header: 'Created At', accessor: 'createdAt' },
          { header: 'ID', accessor: 'orcabusId' },
        ]}
        tableData={tableData}
      />
    </div>
  );
};

export default CaseStateTable;
