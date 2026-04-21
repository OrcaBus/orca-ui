import { Table } from '@/components/tables';
import { dayjs, TIMESTAMP_FORMAT } from '@/utils/dayjs';
import { useQueryCaseHistoryObject } from '@/api/case';
import { components } from '@/api/types/case';

type HistoryType = components['schemas']['HistoryTypeEnum'];

const historyTypeLabel: Record<HistoryType, string> = {
  '+': 'Created',
  '~': 'Updated',
  '-': 'Deleted',
};

const CaseHistoryTable = ({ caseOrcabusId }: { caseOrcabusId: string }) => {
  const caseHistory = useQueryCaseHistoryObject({
    params: { path: { orcabusId: caseOrcabusId } },
  });

  const results = caseHistory.data?.results ?? [];

  const tableData = results.map((h) => ({
    historyDate: dayjs(h.historyDate).format(TIMESTAMP_FORMAT),
    historyType: historyTypeLabel[h.historyType],
    historyUserId: h.historyUserId ?? '-',
    historyChangeReason: h.historyChangeReason ?? '-',
    title: h.title,
    type: h.type,
    studyType: h.studyType,
    isReportRequired: h.isReportRequired ? 'yes' : 'no',
    isNataAccredited: h.isNataAccredited ? 'yes' : 'no',
  }));

  return (
    <Table
      isFetchingData={caseHistory.isFetching}
      inCard={false}
      columns={[
        { header: 'Date', accessor: 'historyDate' },
        { header: 'Change', accessor: 'historyType' },
        { header: 'Changed by', accessor: 'historyUserId' },
        { header: 'Change reason', accessor: 'historyChangeReason' },
        { header: 'Title', accessor: 'title' },
        { header: 'Type', accessor: 'type' },
        { header: 'Study type', accessor: 'studyType' },
        { header: 'Report required', accessor: 'isReportRequired' },
        { header: 'NATA accredited', accessor: 'isNataAccredited' },
      ]}
      tableData={tableData}
    />
  );
};

export default CaseHistoryTable;
