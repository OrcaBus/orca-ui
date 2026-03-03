import { useMemo } from 'react';
import { ContentTabs } from '@/components/navigation/tabs';
import { Table, Column, TableData } from '@/components/tables';
import { useAnalysisRunsContext } from './AnalysisRunsContext';
import { Link } from 'react-router-dom';
import { classNames } from '@/utils/commonUtils';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import AnalysisRunsDetailsWorkflowRuns from './AnalysisRunsDetailsWorkflowRuns';
import AnalysisRunsTimeline from './AnalysisRunsTimeline';

const AnalysisRunsDetailsTabs = () => {
  const { analysisRunDetail, workflowRunsCount } = useAnalysisRunsContext();
  const librariesCount = analysisRunDetail?.libraries?.length ?? 0;
  const runContextCount = analysisRunDetail?.contexts?.length ?? 0;
  const readsetsCount = analysisRunDetail?.readsets?.length ?? 0;

  const librariesColumns: Column[] = useMemo(
    () => [
      {
        header: 'Library ID',
        accessor: 'libraryId',
      },
      {
        header: 'Orcabus ID',
        accessor: 'orcabusId',
        cell: (orcabusId: unknown) =>
          orcabusId ? (
            <Link
              to={`/lab/library/${orcabusId}/overview`}
              className={classNames(
                'inline-flex items-center gap-1 text-sm font-medium',
                'text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300'
              )}
            >
              {orcabusId as string}
              <ArrowTopRightOnSquareIcon className='h-3.5 w-3.5' />
            </Link>
          ) : (
            '-'
          ),
      },
    ],
    []
  );

  const runContextColumns: Column[] = useMemo(
    () => [
      {
        header: 'Name',
        accessor: 'name',
      },
      {
        header: 'Usecase',
        accessor: 'usecase',
      },
      {
        header: 'Description',
        accessor: 'description',
      },
      {
        header: 'Status',
        accessor: 'status',
      },
      {
        header: 'Orcabus ID',
        accessor: 'orcabusId',
      },
    ],
    []
  );

  const readsetsColumns: Column[] = useMemo(
    () => [
      {
        header: 'RGID',
        accessor: 'rgid',
      },
      {
        header: 'Library ID',
        accessor: 'libraryId',
        cell: (libraryId: unknown, rowData: TableData) => {
          const libraryOrcabusId = (rowData as { libraryOrcabusId: string }).libraryOrcabusId;
          return (
            <Link
              to={`/lab/library/${libraryOrcabusId}/overview`}
              className={classNames(
                'inline-flex items-center gap-1 text-sm font-medium',
                'text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300'
              )}
            >
              {libraryId as string}
              <ArrowTopRightOnSquareIcon className='h-3.5 w-3.5' />
            </Link>
          );
        },
      },
      {
        header: 'Orcabus ID',
        accessor: 'orcabusId',
      },
    ],
    []
  );

  const tabs = useMemo(
    () => [
      {
        label: `Timeline`,
        content: <AnalysisRunsTimeline />,
      },
      {
        label: `Workflow Runs (${workflowRunsCount})`,
        content: <AnalysisRunsDetailsWorkflowRuns />,
      },
      {
        label: `Libraries (${librariesCount})`,
        content: (
          <TabTable
            columns={librariesColumns}
            data={analysisRunDetail?.libraries ?? []}
            emptyMessage='No libraries linked'
          />
        ),
      },
      {
        label: `Run Context (${runContextCount})`,
        content: (
          <TabTable
            columns={runContextColumns}
            data={analysisRunDetail?.contexts ?? []}
            emptyMessage='No run contexts linked'
          />
        ),
      },
      {
        label: `Readsets (${readsetsCount})`,
        content: (
          <TabTable
            columns={readsetsColumns}
            data={analysisRunDetail?.readsets ?? []}
            emptyMessage='No readsets linked'
          />
        ),
      },
    ],
    [
      workflowRunsCount,
      librariesCount,
      runContextCount,
      readsetsCount,
      analysisRunDetail,
      librariesColumns,
      runContextColumns,
      readsetsColumns,
    ]
  );

  return <ContentTabs tabs={tabs} />;
};

interface TabTableProps {
  columns: Column[];
  data: Record<string, unknown>[];
  emptyMessage: string;
}

const TabTable = ({ columns, data, emptyMessage }: TabTableProps) => {
  return (
    <div className='mt-4'>
      {data.length > 0 ? (
        <Table columns={columns} tableData={data} inCard={true} isFetchingData={false} />
      ) : (
        <div className='rounded-lg border border-gray-200 bg-gray-50 py-8 text-center dark:border-gray-700 dark:bg-gray-800/50'>
          <p className='text-sm text-gray-500 dark:text-gray-400'>{emptyMessage}</p>
        </div>
      )}
    </div>
  );
};

export default AnalysisRunsDetailsTabs;
