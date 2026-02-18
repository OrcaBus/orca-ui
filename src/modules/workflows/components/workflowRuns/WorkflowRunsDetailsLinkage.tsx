import { useMemo } from 'react';
import { Table } from '@/components/tables';
import { useWorkflowRunsContext } from './WorkflowRunsContext';
import { Link } from 'react-router-dom';
import { classNames } from '@/utils/commonUtils';
import { Accordion } from '@/components/common/accordion';

const WorkflowRunsDetailsLinkage = () => {
  const { workflowRunDetail, isFetchingWorkflowRunDetail } = useWorkflowRunsContext();
  const librariesTableData = useMemo(
    () =>
      workflowRunDetail && workflowRunDetail.libraries.length > 0
        ? workflowRunDetail.libraries.map((library) => ({
            libraryId: library.libraryId,
            orcabusId: library.orcabusId,
          }))
        : [],
    [workflowRunDetail]
  );

  const librariesTableColumns = useMemo(
    () => [
      {
        header: 'Library ID',
        accessor: 'libraryId',
      },
      {
        header: 'Orcabus ID',
        accessor: 'orcabusId',
        cell: (orcabusId: unknown) => {
          if (!orcabusId) {
            return <div>-</div>;
          } else {
            return (
              <Link
                to={`/lab/library/${orcabusId}/overview`}
                className={classNames('text-sm font-medium text-blue-500 hover:text-blue-700')}
              >
                <div>{orcabusId as string}</div>
              </Link>
            );
          }
        },
      },
    ],
    []
  );

  return (
    <div className=''>
      <Accordion
        title={
          <div className='flex items-center gap-2'>
            <span>Linked Libraries</span>
            <span className='rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400'>
              {librariesTableData.length}
            </span>
          </div>
        }
        defaultOpen={false}
        className='rounded-lg border border-gray-200 shadow-xs'
        chevronPosition='right'
      >
        <Table
          // tableHeader='Libraries'
          inCard={true}
          columns={librariesTableColumns}
          tableData={librariesTableData}
          isFetchingData={isFetchingWorkflowRunDetail}
        />
      </Accordion>
    </div>
  );
};

export default WorkflowRunsDetailsLinkage;
