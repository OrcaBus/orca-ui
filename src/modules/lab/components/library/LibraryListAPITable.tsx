import { LibraryListQueryParams, useQueryMetadataLibraryModel } from '@/api/metadata';
import { useQueryParams } from '@/hooks/useQueryParams';
import { components } from '@/api/types/metadata';
import { Table } from '@/components/tables';
import { LibraryTableFilter } from '@/modules/lab/components/library/LibraryTableFilter';
import { Search } from '@/components/common/search';
import { getSampleTableColumn } from '../sample/utils';
import { getLibraryTableColumn } from './utils';
import { getSubjectTableColumn } from '../subject/utils';
import { getProjectTableColumn } from '../project/utils';

export const LibraryListAPITable = ({ queryParams }: { queryParams: LibraryListQueryParams }) => {
  const { setQueryParams, getPaginationParams, getQueryParams } = useQueryParams();

  const libraryModel = useQueryMetadataLibraryModel({
    params: { query: { ...queryParams, ...getPaginationParams() } },
  });

  const data = libraryModel.data;

  const flatData = data ? processLibraryResults(data.results) : [];
  const pagination = data?.pagination;

  return (
    <Table
      isFetchingData={libraryModel.isFetching}
      inCard={false}
      tableHeader={
        <div className='flex flex-col md:flex-row'>
          <div className='flex items-center justify-center'>{'Library Table'}</div>
          <div className='flex flex-1 items-center justify-end pt-2'>
            <div className='w-1/5'>
              <Search
                onSearch={(s) => setQueryParams({ search: s })}
                searchBoxContent={getQueryParams().search}
              />
            </div>

            <div className='ml-2'>
              <LibraryTableFilter />
            </div>
          </div>
        </div>
      }
      columns={[
        ...getLibraryTableColumn({
          setSort: (newOrder: string) => {
            setQueryParams({ ordering: newOrder });
          },
          currentSort: queryParams?.ordering,
          headerClassName: 'bg-transparent',
          cellClassName: 'bg-transparent',
        }),
        ...getSubjectTableColumn({
          headerGroupLabel: 'Subject',
          // headerClassName: 'bg-orange-100',
          // cellClassName: 'bg-orange-50',
        }),
        ...getSampleTableColumn({
          headerGroupLabel: 'Sample',
          // headerClassName: 'bg-red-100',
          // cellClassName: 'bg-red-50',
        }),
        ...getProjectTableColumn({
          headerGroupLabel: 'Project',
          // headerClassName: 'bg-indigo-100',
          // cellClassName: 'bg-indigo-50',
        }),
      ]}
      tableData={flatData}
      paginationProps={{
        totalCount: pagination?.count ?? 0,
        rowsPerPage: pagination?.rowsPerPage ?? 0,
        currentPage: pagination?.page ?? 0,
        setPage: (n: number) => {
          setQueryParams({ page: n });
        },
        setRowsPerPage: (n: number) => {
          setQueryParams({ rowsPerPage: n });
        },
      }}
    />
  );
};

/**
 * Process library results record to a flat array of json. Unpack sample and subject from nested
 * JSON object
 * @param data the results returned from the API
 * @returns
 */
export const processLibraryResults = (data: components['schemas']['LibraryDetail'][]) => {
  return data.map((library) => {
    const rec: Record<string, unknown> = {
      // Library Model
      libraryIds: {
        libraryOrcabusId: library.orcabusId,
        libraryId: library.libraryId,
      },
      libraryId: library.libraryId ?? '-',
      phenotype: library.phenotype ?? '-',
      workflow: library.workflow ?? '-',
      quality: library.quality ?? '-',
      type: library.type ?? '-',
      assay: library.assay ?? '-',
      coverage: library.coverage?.toString() ?? '-',
      overrideCycles: library.overrideCycles ?? '-',

      // Sample Model
      sampleIds: {
        sampleOrcabusId: library.sample.orcabusId,
        sampleId: library.sample.sampleId,
      },
      sampleExternalId: library.sample.externalSampleId ?? '-',
      sampleSource: library.sample.source ?? '-',

      // Subject Model
      subjectIds: {
        subjectOrcabusId: library.subject.orcabusId,
        subjectId: library.subject.subjectId,
      },

      // Project Model
      projectIds: library.projectSet.map((project) => ({
        projectOrcabusId: project.orcabusId,
        projectId: project.projectId,
      })),
      projectName: library.projectSet.map((project) => project.name ?? '-'),
    };

    return rec;
  });
};
