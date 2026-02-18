import { useMemo, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useSequenceRunContext } from './SequenceRunContext';
import { Accordion } from '@/components/common/accordion';
import { Table } from '@/components/tables';
import { classNames } from '@/utils/commonUtils';
import { useQueryMetadataLibraryModel } from '@/api/metadata';
import { Badge } from '@/components/common/badges';
import { keepPreviousData } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { TIMESTAMP_FORMAT } from '@/utils/dayjs';

const SequenceRunDetailsLinkage = () => {
  const { sequenceRunDetail, isFetchingSequenceRunDetail } = useSequenceRunContext();

  // const combinedLibraries = useMemo(() => {
  //   return sequenceRunDetail?.flatMap((sequenceRun) => sequenceRun.libraries) || [];
  // }, [sequenceRunDetail]);

  const lastLinkedLibraries = useMemo(() => {
    return sequenceRunDetail?.[0]?.libraries || [];
  }, [sequenceRunDetail]);

  const {
    data: librariesData,
    isFetching: isFetchingLibrariesData,
    isError: isErrorLibrariesData,
    error: errorLibrariesData,
  } = useQueryMetadataLibraryModel({
    params: {
      query: {
        library_id: lastLinkedLibraries,
        rowsPerPage: lastLinkedLibraries.length || 0 + 10,
      },
    },
    reactQuery: {
      enabled: !!lastLinkedLibraries.length,
      placeholderData: keepPreviousData,
    },
  });

  if (isErrorLibrariesData) {
    throw errorLibrariesData;
  }

  const librariesTableData = useMemo(
    () =>
      lastLinkedLibraries && lastLinkedLibraries.length > 0
        ? lastLinkedLibraries.map((library_id) => ({
            libraryId: library_id,
            orcabusId: librariesData?.results?.find((library) => library.libraryId === library_id)
              ?.orcabusId,
          }))
        : [],
    [lastLinkedLibraries, librariesData]
  );

  const sequenceRunsTableColumns = useMemo(
    () => [
      {
        header: 'Sequence Run ID',
        accessor: 'sequenceRunId',
        cell: (sequenceRunId: unknown) => {
          return <div>{sequenceRunId ? (sequenceRunId as string) : '-'}</div>;
        },
      },
      {
        header: 'Status',
        accessor: 'status',
        cell: (status: unknown) => {
          return (
            <Badge status={(status as string) || 'UNKNOWN'}>
              {(status || 'UNKNOWN') as ReactNode}
            </Badge>
          );
        },
      },
      {
        header: 'Start Time',
        accessor: 'startTime',
        cell: (startTime: unknown) => {
          if (!startTime) {
            return <div>-</div>;
          } else {
            return (
              <div>{startTime ? dayjs(startTime as string).format(TIMESTAMP_FORMAT) : '-'}</div>
            );
          }
        },
      },
      {
        header: 'End Time',
        accessor: 'endTime',
        cell: (endTime: unknown) => {
          if (!endTime) {
            return <div>-</div>;
          } else {
            return <div>{endTime ? dayjs(endTime as string).format(TIMESTAMP_FORMAT) : '-'}</div>;
          }
        },
      },
    ],
    []
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
    <div className='flex flex-col gap-4'>
      <Accordion
        title={
          <div className='flex items-center gap-2'>
            <span>Linked Sequence Runs</span>
            <span className='rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400'>
              {sequenceRunDetail ? sequenceRunDetail.length : 0}
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
          columns={sequenceRunsTableColumns}
          tableData={
            sequenceRunDetail?.sort((a, b) => {
              return dayjs(a.startTime).diff(dayjs(b.startTime));
            }) ?? []
          }
          isFetchingData={isFetchingSequenceRunDetail}
        />
      </Accordion>
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
          isFetchingData={isFetchingSequenceRunDetail || isFetchingLibrariesData}
        />
      </Accordion>
    </div>
  );
};

export default SequenceRunDetailsLinkage;
