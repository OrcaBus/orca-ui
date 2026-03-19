import { FC, Suspense } from 'react';
import { useQueryMetadataLibraryModel } from '@/api/metadata';
import { Table } from '@/components/tables';
import { DetailedErrorBoundary } from '@/components/common/error';
import { SpinnerWithText } from '@/components/common/spinner';
import { components } from '@/api/types/metadata';
import { DEFAULT_NON_PAGINATE_PAGE_SIZE } from '@/utils/constant';
import { Link } from 'react-router-dom';
import { classNames } from '@/utils/commonUtils';

type LibraryLinkTableProps = {
  libraryDetail: components['schemas']['LibraryDetail'];
};

export const LibraryLinkTable: FC<LibraryLinkTableProps> = ({ libraryDetail }) => {
  const individualIdArray = libraryDetail.subject.individualSet
    .map((individual) => individual.individualId)
    .filter((id) => id !== null && id !== undefined);

  return (
    <div className=''>
      <DetailedErrorBoundary errorTitle={`Unable to load linked libraries`}>
        <Suspense fallback={<SpinnerWithText text='loading data ...' />}>
          <IndividualLibraryTable individualIdArray={individualIdArray} />
        </Suspense>
      </DetailedErrorBoundary>
    </div>
  );
};

export const IndividualLibraryTable = ({ individualIdArray }: { individualIdArray: string[] }) => {
  const libraryModel = useQueryMetadataLibraryModel({
    params: {
      query: {
        individualId: individualIdArray.join(',') as string,
        rowsPerPage: DEFAULT_NON_PAGINATE_PAGE_SIZE,
      },
    },
  });
  const libraryData = libraryModel.data;

  const isPaginationAvailable = libraryData?.links?.next;

  return (
    <Table
      isFetchingData={libraryModel.isFetching}
      inCard={false}
      tableHeader={
        <div>
          <div className='text-xs font-normal text-slate-400'>
            Determined based on the same individual ID
          </div>
          {isPaginationAvailable && (
            <div className='pt-4 text-xs text-slate-400 italic'>
              *Due to pagination, some libraries may not be shown here.
            </div>
          )}
        </div>
      }
      columns={[
        {
          header: 'Library ID',
          accessor: 'libraryId',
          cell: (libraryId: unknown, rowData: unknown) => {
            const libOrcabusId = (rowData as components['schemas']['LibraryDetail']).orcabusId;
            return (
              <Link
                to={`/lab/library/${libOrcabusId}/overview`}
                className={classNames(
                  'ml-2 text-sm font-medium text-blue-500 capitalize hover:text-blue-700'
                )}
              >
                {libraryId as string}
              </Link>
            );
          },
        },
        {
          header: 'Type',
          accessor: 'type',
        },
        {
          header: 'Individual ID',
          accessor: 'libraryId',
          cell: (_libraryId: unknown, rowData: unknown) => {
            const individual = (rowData as components['schemas']['LibraryDetail']).subject
              .individualSet;
            return (
              <div className='flex flex-col'>
                {individual.map((ind) => (
                  <Link
                    key={ind.orcabusId}
                    to={`/lab/?tab=subject&individualId=${ind.individualId}`}
                    className={classNames(
                      'ml-2 text-sm font-medium text-blue-500 capitalize hover:text-blue-700'
                    )}
                  >
                    {ind.individualId as string}
                  </Link>
                ))}
              </div>
            );
          },
        },
      ]}
      tableData={libraryData?.results ?? []}
    />
  );
};
