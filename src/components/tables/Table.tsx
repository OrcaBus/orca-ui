/* eslint-disable react-refresh/only-export-components */
// https://github.com/ArnaudBarre/eslint-plugin-react-refresh/issues/25#issuecomment-1729071347

import { FC, Fragment, ReactNode } from 'react';
import { classNames } from '@/utils/commonUtils';
import { ChevronDownIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline';
import Pagination, { PaginationProps } from './Pagination';
import { BackdropWithText } from '@/components/common/backdrop';
import Skeleton from 'react-loading-skeleton';
import toaster from '@/components/common/toaster';
import { Tooltip } from '@/components/common/tooltips';
export type TableData = Record<string, unknown>;

export interface Column {
  header: ReactNode;
  headerClassName?: string;
  headerGroup?: { label?: string; colSpan: number; additionalClassName?: string };
  accessor: string;
  cellClassName?: string;
  cell?: (cellData: unknown, rowData: TableData) => ReactNode;
  onSort?: () => void;
  sortDirection?: 'asc' | 'desc' | undefined;
  copyable?: boolean;
}

export interface TableProps {
  tableHeader?: ReactNode | string;
  tableDescription?: string;
  columns: Column[];
  tableData: TableData[];
  striped?: boolean;
  inCard?: boolean;
  stickyHeader?: boolean;
  paginationProps?: PaginationProps;
  isFetchingData?: boolean;
  headerActions?: ReactNode;
  onRowClick?: (row: TableData) => void;
}

const Table: FC<TableProps> = ({
  tableHeader,
  tableDescription,
  columns,
  tableData,
  paginationProps,
  striped = false,
  inCard = true,
  stickyHeader = false,
  isFetchingData = false,
  headerActions,
  onRowClick,
}) => {
  return (
    <div className='w-full'>
      {/* Header Section */}
      {tableHeader && (
        <div className='mb-6 sm:flex sm:items-center sm:justify-between'>
          <div className='sm:flex-auto'>
            {tableHeader && (
              <h1 className='text-xl font-semibold text-gray-900 dark:text-gray-100'>
                {tableHeader}
              </h1>
            )}
            {tableDescription && (
              <p className='mt-2 text-sm text-gray-600 dark:text-gray-400'>{tableDescription}</p>
            )}
          </div>
          {headerActions && (
            <div className='mt-4 sm:mt-0 sm:ml-16 sm:flex-none'>{headerActions}</div>
          )}
        </div>
      )}

      {/* Table Container */}
      <div className='flow-root'>
        <div className='-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8'>
          <div className='inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8'>
            <div
              className={classNames(
                inCard
                  ? 'overflow-hidden shadow-lg ring-1 ring-black/5 sm:rounded-xl dark:shadow-gray-900/30 dark:ring-white/10'
                  : ''
              )}
            >
              <table className='min-w-full divide-y divide-gray-200 dark:divide-gray-700'>
                {/* Header Groups */}
                {columns.find((c) => !!c.headerGroup) && (
                  <thead>
                    <tr>
                      {columns.map((columnProp, index) => {
                        const group = columnProp.headerGroup;
                        if (!group) {
                          return <Fragment key={`subheader-${index}`} />;
                        }

                        return (
                          <th
                            key={`subheader-${index}`}
                            colSpan={group.colSpan}
                            className={classNames(
                              'rounded-t-lg px-4 py-3 text-center text-xs font-semibold tracking-wider uppercase',
                              'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
                              'border-b border-gray-200 dark:border-gray-700',
                              group.additionalClassName
                            )}
                          >
                            {group.label}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                )}

                {/* Main Table Header */}
                <thead className='bg-gray-50 dark:bg-gray-800/80'>
                  <tr>
                    {columns &&
                      columns.map((column, index) => (
                        <th
                          key={`idx-${index}-${column.accessor}`}
                          scope='col'
                          className={classNames(
                            'px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase',
                            'text-gray-700 dark:text-gray-300',
                            'border-b border-gray-200 dark:border-gray-700',
                            'transition-all duration-200 ease-in-out',
                            column.onSort && [
                              'cursor-pointer',
                              'hover:bg-gray-100 dark:hover:bg-gray-700/80',
                              'group relative',
                            ],
                            index === 0 ? 'pl-6 sm:pl-8' : '',
                            index === columns.length - 1 ? 'pr-6 sm:pr-8' : '',
                            stickyHeader && [
                              'sticky top-0 z-10',
                              'backdrop-blur-sm backdrop-saturate-150',
                              'bg-gray-50/95 dark:bg-gray-800/95',
                              'shadow-sm dark:shadow-gray-900/10',
                            ],
                            column.headerClassName
                          )}
                          onClick={() => column.onSort && column.onSort()}
                        >
                          <div
                            className={classNames(
                              'flex items-center gap-2',
                              column.onSort && [
                                'group/sort',
                                'text-gray-700 dark:text-gray-300',
                                'hover:text-gray-900 dark:hover:text-gray-100',
                              ]
                            )}
                          >
                            {column.header}
                            {column.sortDirection && (
                              <span className='flex items-center'>
                                <ChevronDownIcon
                                  className={classNames(
                                    'h-4 w-4',
                                    'text-gray-400 dark:text-gray-500',
                                    'group-hover/sort:text-gray-600 dark:group-hover/sort:text-gray-300',
                                    'transition-all duration-200',
                                    column.sortDirection === 'asc' ? '-rotate-180' : 'rotate-0'
                                  )}
                                />
                              </span>
                            )}
                          </div>
                        </th>
                      ))}
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody
                  className={classNames(
                    'divide-y divide-gray-100 bg-white dark:divide-gray-800 dark:bg-gray-900',
                    inCard ? 'bg-white dark:bg-gray-900' : 'bg-transparent'
                  )}
                >
                  {/* Loading State */}
                  {tableData.length > 0 && isFetchingData && (
                    <tr>
                      <td colSpan={columns.length} className='px-6 py-8'>
                        <BackdropWithText text='Loading data...' isVisible={false} />
                      </td>
                    </tr>
                  )}

                  {/* Data Rows */}
                  {tableData.length > 0
                    ? tableData.map((data, index) => (
                        <tr
                          key={index}
                          onClick={onRowClick ? () => onRowClick(data) : undefined}
                          className={classNames(
                            'border-t border-gray-100 dark:border-gray-800',
                            'bg-white dark:bg-gray-900',
                            'transition-all duration-200',
                            striped ? 'even:bg-gray-50 dark:even:bg-gray-800/50' : '',
                            'hover:bg-gray-50 dark:hover:bg-gray-800/75',
                            onRowClick ? 'cursor-pointer' : ''
                          )}
                        >
                          {columns &&
                            columns.map((column, colIndex) => (
                              <td
                                key={colIndex}
                                className={classNames(
                                  'px-4 py-3 text-sm whitespace-nowrap',
                                  'text-gray-700 dark:text-gray-300',
                                  colIndex === 0 ? 'pl-6 sm:pl-8' : '',
                                  colIndex === columns.length - 1 ? 'pr-6 sm:pr-8' : '',
                                  column.cellClassName ? column.cellClassName : ''
                                )}
                              >
                                {/* Cell Content with Copy Functionality */}
                                <div
                                  className={classNames(
                                    column.copyable ? 'group inline-flex items-center gap-2' : ''
                                  )}
                                >
                                  {column.cell
                                    ? column.cell(data[column.accessor], data)
                                    : (data[column.accessor] as ReactNode)}
                                  {column.copyable && (
                                    <Tooltip
                                      text='Copy to clipboard'
                                      size='small'
                                      background='light'
                                    >
                                      <ClipboardDocumentIcon
                                        className={classNames(
                                          'h-4 w-4 cursor-pointer',
                                          'text-gray-400 dark:text-gray-500',
                                          'opacity-0 group-hover:opacity-100',
                                          'transition-all duration-200',
                                          'hover:text-gray-600 dark:hover:text-gray-300'
                                        )}
                                        onClick={() => {
                                          navigator.clipboard.writeText(
                                            data[column.accessor] as string
                                          );
                                          toaster.success({
                                            title: `Copied ${column.accessor} to clipboard`,
                                          });
                                        }}
                                      />
                                    </Tooltip>
                                  )}
                                </div>
                              </td>
                            ))}
                        </tr>
                      ))
                    : isFetchingData &&
                      [...Array(10)].map((_, index) => (
                        <tr key={index} className='border-t border-gray-100 dark:border-gray-800'>
                          {columns.map((_column, colIndex) => (
                            <td
                              key={colIndex}
                              className='px-4 py-3 text-sm font-medium whitespace-nowrap text-gray-900 dark:text-gray-100'
                            >
                              <Skeleton height={20} />
                            </td>
                          ))}
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {tableData.length === 0 && !isFetchingData && (
        <div className='flex flex-col items-center justify-center py-12 text-center'>
          <div className='mx-auto h-12 w-12 text-gray-400'>
            <svg
              className='h-12 w-12'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
              aria-hidden='true'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={1}
                d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
              />
            </svg>
          </div>
          <h3 className='mt-2 text-sm font-medium text-gray-900 dark:text-gray-100'>
            No data found
          </h3>
        </div>
      )}

      {/* Pagination */}
      {paginationProps && !isFetchingData && <Pagination {...paginationProps} />}
    </div>
  );
};

export default Table;

/**
 * Helper function to sort array of json objects
 */
export const handleSort = ({
  data,
  sortColumn,
  sortDirection,
}: {
  data: Record<string, string>[];
  sortColumn: string;
  sortDirection: 'asc' | 'desc';
}): Record<string, string>[] => {
  const sorted = [...data].sort((a, b) => {
    if (a[sortColumn] && b[sortColumn]) {
      if (a[sortColumn] < b[sortColumn]) return sortDirection === 'asc' ? -1 : 1;
      if (a[sortColumn] > b[sortColumn]) return sortDirection === 'asc' ? 1 : -1;
    }
    return 0;
  });
  return sorted;
};

export const getCurrentSortDirection = (currentSort: string | undefined, key: string) => {
  if (!currentSort || !currentSort.endsWith(key)) {
    return undefined;
  }

  if (currentSort?.startsWith('-')) {
    return 'desc';
  }

  return 'asc';
};

export const getSortValue = (currentSort: string | undefined, key: string) => {
  const currentSortDirection = getCurrentSortDirection(currentSort, key);

  // Going the opposite here from the current sort direction
  return `${currentSortDirection === 'desc' ? '' : '-'}${key}`;
};

export const multiRowCell = (p: unknown) => {
  const data = p as string[] | string;
  return (
    <>
      {Array.isArray(data) ? (
        data.map((item, idx) => (
          <div className='py-2' key={idx}>
            {item}
          </div>
        ))
      ) : (
        <div className='py-2'>{data}</div>
      )}
    </>
  );
};
