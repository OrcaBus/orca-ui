import { Table } from '@/components/tables';
import { DATE_FORMAT, dayjs, TIMESTAMP_FORMAT } from '@/utils/dayjs';
import CaseAddStateButton from './CaseAddStateButton';
import {
  useQueryCaseStatesObject,
  useMutationCaseStateArchive,
  caseStatesPath,
  caseDetailPath,
} from '@/api/case';
import toaster from '@/components/common/toaster';
import { useQueryClient } from '@tanstack/react-query';

const CaseStateTable = ({ caseOrcabusId }: { caseOrcabusId: string }) => {
  const queryClient = useQueryClient();
  const caseStates = useQueryCaseStatesObject({
    params: { path: { orcabusId: caseOrcabusId } },
  });

  const { mutate: archiveState } = useMutationCaseStateArchive({
    reactQuery: {
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: ['get', caseStatesPath, { params: { path: { orcabusId: caseOrcabusId } } }],
        });
        await queryClient.invalidateQueries({
          queryKey: ['get', caseDetailPath, { params: { path: { orcabusId: caseOrcabusId } } }],
        });
        toaster.success({ title: 'State archived' });
      },
    },
  });

  const tableData = (caseStates.data?.results ?? []).map((s) => ({
    orcabusId: s.orcabusId,
    status: s.status,
    eventDate: s.eventDate ? dayjs(s.eventDate).format(DATE_FORMAT) : '-',
    eventTime: s.eventTime ?? '-',
    createdAt: dayjs(s.createdAt).format(TIMESTAMP_FORMAT),
    createdBy: s.createdBy ?? '-',
    isArchived: s.isArchived,
    archivedBy: s.archivedBy ?? '-',
    archivedAt: s.archivedAt ? dayjs(s.archivedAt).format(TIMESTAMP_FORMAT) : '-',
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
          { header: 'Event Date', accessor: 'eventDate' },
          { header: 'Event Time', accessor: 'eventTime' },
          { header: 'Created At', accessor: 'createdAt' },
          { header: 'Created By', accessor: 'createdBy' },
          {
            header: 'Archived',
            accessor: 'isArchived',
            cell: (id) => (id ? 'yes' : 'no'),
          },
          { header: 'Archived At', accessor: 'archivedAt' },
          { header: 'Archived By', accessor: 'archivedBy' },
          { header: 'ID', accessor: 'orcabusId' },
          {
            header: '',
            accessor: 'orcabusId',
            cell: (id, row) =>
              !row.isArchived ? (
                <button
                  className='text-xs text-red-600 hover:underline dark:text-red-400'
                  onClick={() => archiveState(id as string)}
                >
                  Archive
                </button>
              ) : null,
          },
        ]}
        tableData={tableData}
      />
    </div>
  );
};

export default CaseStateTable;
