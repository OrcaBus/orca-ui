import { Table } from '@/components/tables';
import { dayjs, TIMESTAMP_FORMAT } from '@/utils/dayjs';
import { components } from '@/api/types/case';

type Comment = components['schemas']['Comment'];

const CaseCommentTable = ({ commentSet }: { commentSet: Comment[] }) => {
  const tableData = commentSet.map((c) => ({
    createdAt: dayjs(c.createdAt).format(TIMESTAMP_FORMAT),
    createdBy: c.createdBy ?? '-',
    text: c.text ?? '-',
    isArchived: c.isArchived ? 'yes' : 'no',
    archivedBy: c.archivedBy ?? '-',
    archivedAt: c.archivedAt ? dayjs(c.archivedAt).format(TIMESTAMP_FORMAT) : '-',
  }));

  return (
    <Table
      inCard={false}
      columns={[
        { header: 'Date', accessor: 'createdAt' },
        { header: 'Created by', accessor: 'createdBy' },
        { header: 'Comment', accessor: 'text' },
        { header: 'Archived', accessor: 'isArchived' },
        { header: 'Archived by', accessor: 'archivedBy' },
        { header: 'Archived at', accessor: 'archivedAt' },
      ]}
      tableData={tableData}
    />
  );
};

export default CaseCommentTable;
