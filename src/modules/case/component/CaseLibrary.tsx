/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { Table } from '@/components/tables';
import { DEFAULT_NON_PAGINATE_PAGE_SIZE } from '@/utils/constant';
import { useQueryMetadataLibraryModel } from '@/api/metadata';
import { getLibraryTableColumn } from '@/modules/lab/components/library/utils';
import { classNames } from '@/utils/commonUtils';
import CaseUnlinkEntityButton from './CaseUnlinkEntityButton';
import { dayjs, TIMESTAMP_FORMAT } from '@/utils/dayjs';

const CaseLibraryTable = ({
  externalEntitySet,
  caseOrcabusId,
}: {
  externalEntitySet: Record<string, any>[];
  caseOrcabusId: string;
}) => {
  const [isUnlinking, setIsUnlinking] = useState(false);

  // we want just the case for the library metadata for this component,
  // we will split this orcabusId map to its full case detail
  const libraryMapCase: Record<string, any> = {};
  externalEntitySet.forEach((o) => {
    if (o.externalEntity.serviceName == 'metadata' && o.externalEntity.type == 'library') {
      libraryMapCase[o.externalEntity.orcabusId] = { ...o };
    }
  });
  const libraryOrcabusIdArray = Object.keys(libraryMapCase);
  const libraryModel = useQueryMetadataLibraryModel({
    params: {
      query: {
        orcabusId: libraryOrcabusIdArray,
        rowsPerPage: DEFAULT_NON_PAGINATE_PAGE_SIZE,
      },
    },
    reactQuery: {
      enabled: libraryOrcabusIdArray.length > 0,
    },
  });

  const data = libraryModel.data;
  const dataArr = data?.results ?? [];

  const flatData =
    dataArr
      .filter((o) => {
        const rawOrcabusId = o.orcabusId.split('.')[1];
        return libraryMapCase[rawOrcabusId];
      })
      .map((o) => {
        const rawOrcabusId = o.orcabusId.split('.')[1];

        return {
          libraryIds: {
            libraryOrcabusId: o.orcabusId,
            libraryId: o.libraryId,
          },
          libraryId: o.libraryId ?? '-',
          phenotype: o.phenotype ?? '-',
          workflow: o.workflow ?? '-',
          quality: o.quality ?? '-',
          type: o.type ?? '-',
          assay: o.assay ?? '-',
          coverage: o.coverage?.toString() ?? '-',
          overrideCycles: o.overrideCycles ?? '-',
          caseAddedVia: libraryMapCase[rawOrcabusId]?.addedVia,
          caseTimestamp:
            dayjs(libraryMapCase[rawOrcabusId]?.timestamp).format(TIMESTAMP_FORMAT) ?? '-',
        };
      }) ?? [];

  return (
    <Table
      isFetchingData={libraryModel.isFetching}
      inCard={false}
      columns={[
        ...getLibraryTableColumn({
          headerClassName: 'bg-transparent',
          cellClassName: 'bg-transparent',
        }),
        {
          header: 'Added via',
          headerClassName: classNames(
            'bg-red-50/90 dark:bg-red-900/40',
            'text-gray-900 dark:text-gray-100',
            'transition-all duration-200'
          ),
          accessor: 'caseAddedVia',
        },
        {
          header: 'Linked on',
          headerClassName: classNames(
            'bg-red-50/90 dark:bg-red-900/40',
            'text-gray-900 dark:text-gray-100',
            'transition-all duration-200'
          ),
          accessor: 'caseTimestamp',
        },
        {
          header: '',
          headerClassName: classNames(
            'bg-red-50/90 dark:bg-red-900/40',
            'text-gray-900 dark:text-gray-100',
            'transition-all duration-200'
          ),
          accessor: 'libraryIds',
          cell: (val) => {
            type LibraryIdType = { libraryOrcabusId: string; libraryId: string };
            return (
              <CaseUnlinkEntityButton
                entityId={(val as LibraryIdType).libraryId}
                entityOrcabusId={(val as LibraryIdType).libraryOrcabusId}
                caseOrcabusId={caseOrcabusId}
                disabled={isUnlinking}
                setIsUnlinking={setIsUnlinking}
              />
            );
          },
        },
      ]}
      tableData={flatData}
    />
  );
};

export default CaseLibraryTable;
