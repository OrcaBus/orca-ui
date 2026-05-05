import { Table } from '@/components/tables';
import { dayjs, TIMESTAMP_FORMAT } from '@/utils/dayjs';
import CaseAddStateButton from './CaseAddStateButton';
import { useQueryCaseStatesObject, useMutationCaseStateArchive, caseStatesPath } from '@/api/case';
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
        toaster.success({ title: 'State archived' });
      },
    },
  });

  const tableData = (caseStates.data?.results ?? []).map((s) => ({
    orcabusId: s.orcabusId,
    status: s.status,
    eventAt: dayjs(s.eventAt).format(TIMESTAMP_FORMAT),
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
          { header: 'Event At', accessor: 'eventAt' },
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
