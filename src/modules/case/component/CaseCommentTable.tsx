import { useState } from 'react';
import { Table } from '@/components/tables';
import { dayjs, TIMESTAMP_FORMAT } from '@/utils/dayjs';
import { components } from '@/api/types/case';
import { useMutationCommentCreate, useMutationCommentArchive } from '@/api/case';
import { useQueryClient } from '@tanstack/react-query';
import toaster from '@/components/common/toaster';

type Comment = components['schemas']['Comment'];

const CaseCommentTable = ({
  commentSet,
  caseOrcabusId,
}: {
  commentSet: Comment[];
  caseOrcabusId: string;
}) => {
  const [text, setText] = useState('');
  const queryClient = useQueryClient();

  const { mutate: archiveComment } = useMutationCommentArchive({
    reactQuery: {
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: ['get'] });
        toaster.success({ title: 'Comment archived' });
      },
    },
  });

  const { mutate: postComment, isPending } = useMutationCommentCreate({
    reactQuery: {
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: ['get'] });
        toaster.success({ title: 'Comment added' });
        setText('');
      },
    },
  });
  const tableData = commentSet.map((c) => ({
    orcabusId: c.orcabusId,
    createdAt: dayjs(c.createdAt).format(TIMESTAMP_FORMAT),
    createdBy: c.createdBy ?? '-',
    text: c.text ?? '-',
    isArchived: c.isArchived,
    archivedBy: c.archivedBy ?? '-',
    archivedAt: c.archivedAt ? dayjs(c.archivedAt).format(TIMESTAMP_FORMAT) : '-',
  }));

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex items-end gap-2'>
        <textarea
          rows={2}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder='Write a comment...'
          className='flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:focus:border-blue-400'
        />
        <button
          disabled={!text.trim() || isPending}
          onClick={() => postComment({ text, case: caseOrcabusId })}
          className='rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600'
        >
          {isPending ? 'Posting...' : 'Post Comment'}
        </button>
      </div>
      <Table
        inCard={false}
        columns={[
          { header: 'Comment', accessor: 'text' },
          { header: 'Created By', accessor: 'createdBy' },
          { header: 'Created At', accessor: 'createdAt' },
          {
            header: 'Archived',
            accessor: 'isArchived',
            cell: (id) => (id ? 'yes' : 'no'),
          },
          { header: 'Archived At', accessor: 'archivedAt' },
          { header: 'Archived By', accessor: 'archivedBy' },
          {
            header: '',
            accessor: 'orcabusId',
            cell: (id, row) =>
              !row.isArchived ? (
                <button
                  className='text-xs text-red-600 hover:underline dark:text-red-400'
                  onClick={() => archiveComment(id as string)}
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

export default CaseCommentTable;
