import React, { useState } from 'react';
import { Dialog } from '@/components/common/dialogs';
import { caseDetailPath, useMutationCaseLinkEntity } from '@/api/case';
import toaster from '@/components/common/toaster';
import { useQueryClient } from '@tanstack/react-query';
import { SpinnerWithText } from '@/components/common/spinner';
import { Button } from '@/components/common/buttons';
import { PlusCircleIcon } from '@heroicons/react/24/outline';
import { Column, Table, TableData } from '@/components/tables';
import { DEFAULT_NON_PAGINATE_PAGE_SIZE } from '@/utils/constant';

type DataQueryHook<TData = unknown> = (options: {
  params: {
    query: {
      search: string;
      rowsPerPage: number;
    };
  };
  reactQuery: {
    enabled: boolean;
  };
}) => {
  data?: {
    results?: TData[];
  };
  isFetching: boolean;
};

function CaseLinkEntityButton<TData>({
  caseOrcabusId,
  entityName,
  useEntityQuery,
  tableSelectionColumn,
  processDataBeforeTable,
  extractEntityFromRow,
}: {
  caseOrcabusId: string;
  entityName: string;
  useEntityQuery: DataQueryHook<TData>;
  tableSelectionColumn: Column[];
  processDataBeforeTable: (data: TData[]) => TableData[];
  extractEntityFromRow: (row: TableData) => { orcabusId: string; displayId: string };
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEntity, setSelectedEntity] = useState<{
    orcabusId: string;
    displayId: string;
  } | null>(null);
  const queryClient = useQueryClient();

  const responseUseQuery = useEntityQuery({
    params: {
      query: {
        search: searchQuery,
        rowsPerPage: DEFAULT_NON_PAGINATE_PAGE_SIZE,
      },
    },
    reactQuery: {
      enabled: isDialogOpen,
    },
  });
  const queryResults = responseUseQuery.data?.results ?? [];
  const { isPending, isError, error, mutate } = useMutationCaseLinkEntity({
    reactQuery: {
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: ['GET', caseDetailPath, { path: { orcabusId: caseOrcabusId } }],
        });
        toaster.success({ title: `'${selectedEntity?.displayId}' linked` });
        setIsDialogOpen(false);
        setSelectedEntity(null);
        setSearchQuery('');
      },
    },
  });

  if (isPending) {
    return <SpinnerWithText text='Saving changes ...' />;
  }

  if (isError) {
    throw error;
  }
  return (
    <>
      <Button
        onClick={() => {
          setIsDialogOpen(true);
        }}
        type='primary'
        size='md'
        className='px-6 shadow-sm transition-shadow duration-200 hover:shadow-md'
      >
        Link {entityName}
        <PlusCircleIcon className='h-5 w-5' />
      </Button>

      <Dialog
        open={isDialogOpen}
        size='xl'
        title={`Link ${entityName}`}
        content={
          <div className='w-full space-y-4 bg-white p-6 dark:bg-gray-800'>
            {selectedEntity ? (
              <div className='rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20'>
                <div className='flex items-center justify-between'>
                  <p className='text-sm text-blue-900 dark:text-blue-100'>
                    Selected:{' '}
                    <p className='mt-2 font-mono text-base font-semibold break-all text-blue-900 dark:text-blue-100'>
                      {selectedEntity.displayId}
                    </p>
                  </p>
                  <button
                    onClick={() => setSelectedEntity(null)}
                    className='text-xs text-blue-700 underline transition-colors duration-200 hover:text-blue-900 dark:text-blue-300 dark:hover:text-blue-100'
                  >
                    Clear
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <input
                    type='text'
                    placeholder='Search records...'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className='w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100'
                  />
                  <p className='mt-2 text-xs text-gray-500 dark:text-gray-400'>
                    Click on a row below to select
                  </p>
                </div>
                <div className='max-h-96 overflow-y-auto'>
                  <Table
                    isFetchingData={responseUseQuery.isFetching}
                    inCard={false}
                    columns={[
                      {
                        header: '',
                        headerClassName: 'bg-gray-50 dark:bg-gray-800 w-24',
                        accessor: '',
                        cell: () => (
                          <Button size='xs' type='gray'>
                            Select
                          </Button>
                        ),
                      },
                      ...tableSelectionColumn,
                    ]}
                    tableData={processDataBeforeTable(queryResults)}
                    onRowClick={(row) => {
                      setSelectedEntity(extractEntityFromRow(row));
                    }}
                  />
                </div>
              </>
            )}
          </div>
        }
        onClose={() => {
          setIsDialogOpen(false);
          setSelectedEntity(null);
          setSearchQuery('');
        }}
        closeBtn={{
          label: 'Cancel',
          onClick: () => {
            setIsDialogOpen(false);
            setSelectedEntity(null);
            setSearchQuery('');
          },
        }}
        confirmBtn={{
          label: 'Link',
          disabled: !selectedEntity,
          className:
            'text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600 shadow-md hover:shadow-lg border-none disabled:opacity-50 disabled:cursor-not-allowed',
          onClick: () => {
            if (selectedEntity) {
              mutate({
                addedVia: 'console',
                case: caseOrcabusId,
                externalEntity: selectedEntity.orcabusId,
              });
            }
          },
        }}
      />
    </>
  );
}

export default CaseLinkEntityButton;
