import { Table } from '@/components/tables';
import { dayjs, TIMESTAMP_FORMAT } from '@/utils/dayjs';
import { components } from '@/api/types/case';
import CaseAddStateButton from './CaseAddStateButton';

const CaseStateTable = ({
  stateSet,
  caseOrcabusId,
}: {
  stateSet: components['schemas']['State'][];
  caseOrcabusId: string;
}) => {
  const tableData = stateSet.map((s) => ({
    orcabusId: s.orcabusId,
    status: s.status,
    timestamp: dayjs(s.timestamp).format(TIMESTAMP_FORMAT),
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
          { header: 'Timestamp', accessor: 'timestamp' },
          { header: 'ID', accessor: 'orcabusId' },
        ]}
        tableData={tableData}
      />
    </div>
  );
};

export default CaseStateTable;
