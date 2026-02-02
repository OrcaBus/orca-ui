import { useState } from 'react';
import { getTableColumn } from '@/modules/files/components/FileAPITable';
import { useQueryFileObject } from '@/api/file';
import { GroupedTable } from '@/components/tables';
import { Column, TableData } from '@/components/tables/GroupedRowTable';
import { Dropdown } from '@/components/common/dropdowns';
import { DEFAULT_NON_PAGINATE_PAGE_SIZE } from '@/utils/constant';
import { SpinnerWithText } from '@/components/common/spinner';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { Badge } from '@/components/common/badges';

function FileWorkflowViewer({
  workflowRuns,
  keyPatterns,
  getTableDataFormat,
}: {
  workflowRuns: { workflowName: string; portalRunId: string }[];
  keyPatterns: string[];
  getTableDataFormat: (data: ({ key: string } & Record<string, unknown>)[]) => TableData[];
}) {
  // sort the workflowRun based on descending of portal run id
  const sortedWorkflowRuns = [...workflowRuns].sort((a, b) =>
    b.portalRunId.localeCompare(a.portalRunId)
  );
  const [selectedWorkflowRun, setSelectedWorkflowRun] = useState(sortedWorkflowRuns[0]);

  const fileQueryResult = useQueryFileObject({
    params: {
      query: {
        'key[]': keyPatterns,
        rowsPerPage: DEFAULT_NON_PAGINATE_PAGE_SIZE,
        currentState: true,
        'attributes[portalRunId]': selectedWorkflowRun.portalRunId,
      },
    },
  });

  if (fileQueryResult.isFetching) {
    return <SpinnerWithText text='Loading data ...' />;
  }

  const fileQueryData = fileQueryResult.data;
  const isDataPaginated = !!fileQueryData && fileQueryData.links.next !== null;
  if (!fileQueryData?.results) {
    throw new Error('No report found!');
  }

  const tableData = fileQueryData.results.map((item) => ({
    key: item.key,
    lastModifiedDate: item.lastModifiedDate,
    size: item.size,
    fileRecord: item,
  }));

  const isMultipleRuns = sortedWorkflowRuns.length > 1;
  return (
    <div className='mt-8 mb-4'>
      <GroupedTable
        tableHeader={
          <div className='flex flex-col space-y-2'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center'>
                <div className='text-gray-900 dark:text-gray-100'>
                  {selectedWorkflowRun.workflowName}
                </div>
              </div>
              {isMultipleRuns && (
                <div className='flex items-center space-x-3'>
                  <Badge
                    type='warning'
                    className='inline-flex items-center py-2 text-sm font-medium whitespace-nowrap'
                  >
                    <ExclamationTriangleIcon className='mr-2 h-5 w-5' />
                    <span>Multiple Runs</span>
                  </Badge>
                  <Dropdown
                    floatingLabel='Portal Run ID'
                    value={selectedWorkflowRun.portalRunId}
                    items={sortedWorkflowRuns.map((i) => ({
                      label: i.portalRunId,
                      onClick: () => setSelectedWorkflowRun(i),
                    }))}
                    className='min-w-[200px] dark:bg-gray-800 dark:text-gray-200'
                  />
                </div>
              )}
            </div>
            {isDataPaginated && (
              <div className='text-xs text-gray-500 italic dark:text-gray-400'>
                * Due to pagination, some files may not be shown here.
              </div>
            )}
          </div>
        }
        striped={false}
        columns={getTableColumn({ isHideKeyPrefix: true }) as Column[]}
        tableData={getTableDataFormat(tableData)}
      />
    </div>
  );
}

export default FileWorkflowViewer;
