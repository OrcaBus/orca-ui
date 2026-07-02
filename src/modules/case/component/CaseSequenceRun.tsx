/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState } from 'react';
import { Table, Column, TableData } from '@/components/tables';
import { dayjs, TIMESTAMP_FORMAT } from '@/utils/dayjs';
import { Badge } from '@/components/common/badges';
import { DEFAULT_NON_PAGINATE_PAGE_SIZE } from '@/utils/constant';
import { useSequenceRunListModel } from '@/api/sequenceRun';
import { MultiqcIcon } from '@/components/icons/MultiqcIcon';
import { Tooltip } from '@/components/common/tooltips';
import { RedirectLink } from '@/components/common/link';
import { TableCellsIcon } from '@heroicons/react/24/outline';
import { classNames } from '@/utils/commonUtils';
import CaseUnlinkEntityButton from './CaseUnlinkEntityButton';
import { ReactNode } from 'react';

const CaseSequenceRunTable = ({
  externalEntitySet,
  caseOrcabusId,
}: {
  externalEntitySet: Record<string, any>[];
  caseOrcabusId: string;
}) => {
  const [isUnlinking, setIsUnlinking] = useState(false);

  // keyed by raw orcabusId (no prefix), value is the full link entry
  const seqMapCase: Record<string, any> = useMemo(() => {
    const map: Record<string, any> = {};
    externalEntitySet.forEach((o) => {
      if (o.externalEntity.serviceName === 'sequence' && o.externalEntity.type === 'sequence_run') {
        map[o.externalEntity.orcabusId] = { ...o };
      }
    });
    return map;
  }, [externalEntitySet]);

  const {
    data: sequenceRunsData,
    error,
    isError,
    isFetching,
  } = useSequenceRunListModel({
    params: {
      query: {
        rowsPerPage: DEFAULT_NON_PAGINATE_PAGE_SIZE,
        orcabusId: Object.keys(seqMapCase),
      },
    },
    reactQuery: {
      enabled: Object.keys(seqMapCase).length > 0,
    },
  });

  if (isError) {
    throw error;
  }

  const sequenceRunColumn: Column[] = useMemo(
    () => [
      {
        header: 'Instrument Run ID',
        accessor: 'instrumentRunId',
        cell: (instrumentRunId: unknown, rowData: TableData) => {
          const sequenceRunId = rowData.sequenceRunId ? (rowData.sequenceRunId as string) : '-';
          return (
            <div className='flex flex-col items-start space-y-1 px-1'>
              <div className='flex items-center gap-2'>
                <RedirectLink
                  to={`/sequence/${instrumentRunId}`}
                  className='text-sm font-semibold text-blue-600 transition-colors duration-200 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300'
                >
                  {instrumentRunId ? (instrumentRunId as string) : '-'}
                </RedirectLink>
              </div>
              <Badge status='UNKNOWN'>
                <div className='flex items-center gap-2 pl-2'>
                  <span className='text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400'>
                    Run ID
                  </span>
                  <span className='font-mono text-xs font-medium text-gray-700 dark:text-gray-300'>
                    {sequenceRunId}
                  </span>
                </div>
              </Badge>
            </div>
          );
        },
      },
      {
        header: 'Experiment Name',
        accessor: 'experimentName',
        cell: (experimentName: unknown) => (
          <div>{experimentName ? (experimentName as string) : '-'}</div>
        ),
      },
      {
        header: 'Sequencing',
        accessor: 'status',
        cell: (status: unknown) => (
          <Badge status={(status as string) || 'UNKNOWN'}>
            {(status || 'UNKNOWN') as ReactNode}
          </Badge>
        ),
      },
      {
        header: 'Start Time',
        accessor: 'startTime',
        cell: (startTime: unknown) => {
          if (!startTime) return <div>-</div>;
          return <div>{dayjs(startTime as string).format(TIMESTAMP_FORMAT)}</div>;
        },
      },
      {
        header: 'End Time',
        accessor: 'endTime',
        cell: (endTime: unknown) => {
          if (!endTime) return <div>-</div>;
          return <div>{dayjs(endTime as string).format(TIMESTAMP_FORMAT)}</div>;
        },
      },
      {
        header: '',
        accessor: 'instrumentRunId',
        cell: (instrumentRunId: unknown) => {
          const filesParams = new URLSearchParams([
            ['key', `*${instrumentRunId}_multiqc_report.html`],
          ]);
          const vaultParams = new URLSearchParams({
            filter: JSON.stringify({
              and: [{ sequencingRunId: { equalTo: instrumentRunId } }],
            }),
          });
          return (
            <div className='flex flex-row items-center gap-2'>
              <Tooltip text='MultiQC Report' size='small' background='light'>
                <RedirectLink to={`/files?${filesParams.toString()}`}>
                  <MultiqcIcon className='size-4 text-orange-300 hover:text-orange-600' />
                </RedirectLink>
              </Tooltip>
              <Tooltip
                position='left'
                text='View metadata warehouse records'
                size='small'
                background='light'
              >
                <RedirectLink to={`/vault?tableName=LIMS&${vaultParams.toString()}`}>
                  <TableCellsIcon className='h-5 w-5 text-blue-400 hover:text-blue-600' />
                </RedirectLink>
              </Tooltip>
            </div>
          );
        },
      },
      {
        header: 'Added via',
        headerClassName: classNames(
          'bg-red-50/90 dark:bg-red-900/40',
          'text-gray-900 dark:text-gray-100',
          'transition-all duration-200'
        ),
        accessor: 'orcabusId',
        cell: (orcabusId: unknown) => {
          const rawId = (orcabusId as string).split('.').pop()!;
          return <>{seqMapCase[rawId]?.addedVia ?? '-'}</>;
        },
      },
      {
        header: 'Linked on',
        headerClassName: classNames(
          'bg-red-50/90 dark:bg-red-900/40',
          'text-gray-900 dark:text-gray-100',
          'transition-all duration-200'
        ),
        accessor: 'orcabusId',
        cell: (orcabusId: unknown) => {
          const rawId = (orcabusId as string).split('.').pop()!;
          const ts = seqMapCase[rawId]?.timestamp;
          return <>{ts ? dayjs(ts).format(TIMESTAMP_FORMAT) : '-'}</>;
        },
      },
      {
        header: '',
        headerClassName: classNames(
          'bg-red-50/90 dark:bg-red-900/40',
          'text-gray-900 dark:text-gray-100',
          'transition-all duration-200'
        ),
        accessor: 'orcabusId',
        cell: (orcabusId: unknown) => {
          const rawId = (orcabusId as string).split('.').pop()!;
          return (
            <CaseUnlinkEntityButton
              entityId={seqMapCase[rawId]?.externalEntity?.alias}
              entityOrcabusId={rawId}
              caseOrcabusId={caseOrcabusId}
              disabled={isUnlinking}
              setIsUnlinking={setIsUnlinking}
            />
          );
        },
      },
    ],
    [caseOrcabusId, seqMapCase, isUnlinking]
  );

  return (
    <div className='mt-4'>
      <Table
        columns={[...sequenceRunColumn]}
        tableData={sequenceRunsData?.results ?? []}
        inCard={true}
        isFetchingData={isFetching}
      />
    </div>
  );
};

export default CaseSequenceRunTable;
