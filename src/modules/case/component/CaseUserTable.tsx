import { useState } from 'react';
import { Table } from '@/components/tables';
import { dayjs, TIMESTAMP_FORMAT } from '@/utils/dayjs';
import { components } from '@/api/types/case';
import { useMutationCaseUserCreate, useMutationCaseUserDelete } from '@/api/case';
import { useQueryClient } from '@tanstack/react-query';
import { Dialog } from '@/components/common/dialogs';
import toaster from '@/components/common/toaster';

function AddUserButton({ caseOrcabusId }: { caseOrcabusId: string }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [description, setDescription] = useState('');
  const queryClient = useQueryClient();

  const { isPending, mutate } = useMutationCaseUserCreate({
    caseOrcabusId,
    reactQuery: {
      onSuccess: async () => {
        await queryClient.invalidateQueries();

        toaster.success({ title: `User '${email}' added` });
        setEmail('');
        setDescription('');
        setIsDialogOpen(false);
      },
      onError: () => {
        toaster.error({ title: 'Failed to add user' });
      },
    },
  });

  return (
    <>
      <button
        className='rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
        onClick={() => setIsDialogOpen(true)}
      >
        + Add User
      </button>

      <Dialog
        open={isDialogOpen}
        size='md'
        title='Add User'
        content={
          <div className='mx-4 w-full max-w-md bg-white p-6 dark:bg-gray-800'>
            <div className='mb-4'>
              <label className='mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300'>
                Email
              </label>
              <input
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder='user@example.com'
                className='w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white'
              />
            </div>
            <div>
              <label className='mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300'>
                Description
              </label>
              <input
                type='text'
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder='e.g. Case Owner'
                className='w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white'
              />
            </div>
          </div>
        }
        onClose={() => setIsDialogOpen(false)}
        closeBtn={{ label: 'Cancel', onClick: () => setIsDialogOpen(false) }}
        confirmBtn={{
          label: isPending ? 'Adding...' : 'Add User',
          className:
            'text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600 shadow-md hover:shadow-lg border-none',
          onClick: () => mutate({ email, description: description || null }),
        }}
      />
    </>
  );
}

function DeleteUserButton({
  caseOrcabusId,
  userOrcabusId,
  userEmail,
}: {
  caseOrcabusId: string;
  userOrcabusId: string;
  userEmail: string;
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { isPending, mutate } = useMutationCaseUserDelete({
    caseOrcabusId,
    userOrcabusId,
    reactQuery: {
      onSuccess: async () => {
        await queryClient.invalidateQueries();
        toaster.success({ title: `User '${userEmail}' removed` });
        setIsDialogOpen(false);
      },
      onError: () => {
        toaster.error({ title: 'Failed to remove user' });
        setIsDialogOpen(false);
      },
    },
  });

  return (
    <>
      <span
        className='cursor-pointer text-sm font-medium text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300'
        onClick={() => setIsDialogOpen(true)}
      >
        Remove
      </span>

      <Dialog
        open={isDialogOpen}
        size='md'
        title='Remove User'
        content={
          <div className='mx-4 w-full max-w-md bg-white p-6 dark:bg-gray-800'>
            <p className='text-sm text-gray-600 dark:text-gray-400'>
              Are you sure you want to remove this user from the case?
            </p>
            <p className='mt-4 font-mono text-xs text-gray-500'>{userEmail}</p>
          </div>
        }
        onClose={() => setIsDialogOpen(false)}
        closeBtn={{ label: 'Cancel', onClick: () => setIsDialogOpen(false) }}
        confirmBtn={{
          label: isPending ? 'Removing...' : 'Remove',
          className:
            'text-white bg-red-600 hover:bg-red-700 focus:ring-red-500 dark:bg-red-500 dark:hover:bg-red-600 shadow-md hover:shadow-lg border-none',
          onClick: () => mutate(),
        }}
      />
    </>
  );
}

const CaseUserTable = ({
  userSet,
  caseOrcabusId,
}: {
  userSet: components['schemas']['CaseUserLink'][];
  caseOrcabusId: string;
}) => {
  const tableData = userSet.map((u) => ({
    orcabusId: u.user.orcabusId,
    name: u.user.name ?? '-',
    email: u.user.email,
    description: u.description ?? '-',
    timestamp: dayjs(u.timestamp).format(TIMESTAMP_FORMAT),
  }));

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex justify-end'>
        <AddUserButton caseOrcabusId={caseOrcabusId} />
      </div>
      <Table
        inCard={false}
        columns={[
          { header: 'Email', accessor: 'email' },
          { header: 'Description', accessor: 'description' },
          { header: 'Timestamp', accessor: 'timestamp' },
          {
            header: '',
            accessor: 'orcabusId',
            cell: (_, row) => (
              <DeleteUserButton
                caseOrcabusId={caseOrcabusId}
                userOrcabusId={row.orcabusId as string}
                userEmail={row.email as string}
              />
            ),
          },
        ]}
        tableData={tableData}
      />
    </div>
  );
};

export default CaseUserTable;
