import { useQueryParams } from '@/hooks/useQueryParams';
import { Table } from '@/components/tables';
import { useQueryCaseListObject } from '@/api/case';
import { classNames } from '@/utils/commonUtils';
import { RedirectLink } from '@/components/common/link';
import { dayjs, TIMESTAMP_FORMAT } from '@/utils/dayjs';
import { Search } from '@/components/common/search';
import CaseGenerateButton from '../component/CaseGenerationButton';
import { Button } from '@/components/common/buttons';
import { useNavigate } from 'react-router-dom';
import { PlusIcon } from '@heroicons/react/24/outline';

const standardClassName = classNames(
  'text-gray-900 dark:text-gray-100',
  'transition-all duration-200',
  'bg-transparent'
);
export const CaseListAPITable = () => {
  const navigate = useNavigate();
  const { setQueryParams, getPaginationParams, getQueryParams } = useQueryParams();
  const queryParams = getQueryParams();

  const caseModel = useQueryCaseListObject({
    params: { query: { ...queryParams, ...getPaginationParams(), ordering: '-timestamp' } },
  });

  const data = caseModel.data;
  const pagination = data?.pagination;

  return (
    <Table
      isFetchingData={caseModel.isFetching}
      inCard={false}
      tableHeader={
        <div className='flex flex-col md:flex-row'>
          <div className='flex items-center justify-center'>{'Case Table'}</div>
          <div className='flex flex-1 flex-col items-stretch gap-3 pt-2 md:flex-row md:items-center md:justify-end'>
            <Button type='green' onClick={() => navigate('./new')}>
              <PlusIcon className='h-5 w-5' />
              New Case
            </Button>
            <CaseGenerateButton />
            <div className='w-full md:w-1/5'>
              <Search
                onSearch={(s) => setQueryParams({ search: s })}
                searchBoxContent={queryParams.search}
              />
            </div>
          </div>
        </div>
      }
      columns={[
        {
          header: 'Title',
          headerClassName: standardClassName,
          accessor: 'title',
          cell: (cellData: unknown) => {
            const { text, orcabusId } = cellData as { text: string; orcabusId: string };
            return (
              <RedirectLink className='normal-case' to={`/case/${orcabusId}`}>
                {text}
              </RedirectLink>
            );
          },
        },
        {
          header: 'Alias',
          headerClassName: standardClassName,
          accessor: 'alias',
          cell: (cellData: unknown) => {
            const aliasArr = cellData as string[];
            if (!aliasArr || aliasArr.length === 0) {
              return <>-</>;
            }
            return (
              <ul className='list-disc space-y-1 pl-5'>
                {aliasArr.map((item, index) => (
                  <li key={index} className='text-gray-900 dark:text-gray-100'>
                    {item}
                  </li>
                ))}
              </ul>
            );
          },
        },
        {
          header: 'Description',
          headerClassName: standardClassName,
          accessor: 'description',
        },
        {
          header: 'Type',
          headerClassName: standardClassName,
          accessor: 'type',
        },
        {
          header: 'Last modified',
          headerClassName: standardClassName,
          accessor: 'lastModified',
          sortDirection: 'desc',
        },
      ]}
      tableData={data.results.map((a) => ({
        orcabusId: a.orcabusId,
        title: { text: a.title, orcabusId: a.orcabusId },
        description: a.description ?? '-',
        type: a.type ?? '-',
        lastModified: dayjs(a.lastModified).format(TIMESTAMP_FORMAT),
        alias: a.alias,
      }))}
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

export default function CasePage() {
  return (
    <div className='flex max-w-full flex-col'>
      <CaseListAPITable />
    </div>
  );
}
