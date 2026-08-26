/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { Table } from '@/components/tables';
import { DEFAULT_NON_PAGINATE_PAGE_SIZE } from '@/utils/constant';
import { useQueryMetadataSampleModel } from '@/api/metadata';
import { getSampleTableColumn } from '@/modules/lab/components/sample/utils';
import { classNames } from '@/utils/commonUtils';
import CaseUnlinkEntityButton from './CaseUnlinkEntityButton';
import { dayjs, TIMESTAMP_FORMAT } from '@/utils/dayjs';

const CaseSampleTable = ({
  externalEntitySet,
  caseOrcabusId,
}: {
  externalEntitySet: Record<string, any>[];
  caseOrcabusId: string;
}) => {
  const [isUnlinking, setIsUnlinking] = useState(false);

  // Filter external entities for samples linked to this case
  const sampleMapCase: Record<string, any> = {};
  externalEntitySet.forEach((o) => {
    if (o.externalEntity.serviceName == 'metadata' && o.externalEntity.type == 'sample') {
      sampleMapCase[o.externalEntity.orcabusId] = { ...o };
    }
  });
  const sampleOrcabusIdArray = Object.keys(sampleMapCase);

  const sampleModel = useQueryMetadataSampleModel({
    params: {
      query: {
        orcabusId: sampleOrcabusIdArray,
        rowsPerPage: DEFAULT_NON_PAGINATE_PAGE_SIZE,
      },
    },
    reactQuery: {
      enabled: sampleOrcabusIdArray.length > 0,
    },
  });

  const data = sampleModel.data;
  const dataArr = data?.results ?? [];

  const flatData =
    dataArr
      .filter((o) => {
        const rawOrcabusId = o.orcabusId.split('.')[1];
        return sampleMapCase[rawOrcabusId];
      })
      .map((o) => {
        const rawOrcabusId = o.orcabusId.split('.')[1];

        return {
          sampleIds: {
            sampleOrcabusId: o.orcabusId,
            sampleId: o.sampleId ?? '-',
          },
          sampleExternalId: o.externalSampleId ?? '-',
          sampleSource: o.source ?? '-',

          // Case-specific fields
          caseAddedVia: sampleMapCase[rawOrcabusId]?.addedVia,
          caseTimestamp:
            dayjs(sampleMapCase[rawOrcabusId]?.timestamp).format(TIMESTAMP_FORMAT) ?? '-',
        };
      }) ?? [];

  return (
    <Table
      isFetchingData={sampleModel.isFetching}
      inCard={false}
      columns={[
        ...getSampleTableColumn({
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
          accessor: 'sampleIds',
          cell: (val) => {
            type SampleIdType = { sampleOrcabusId: string; sampleId: string };
            return (
              <CaseUnlinkEntityButton
                entityId={(val as SampleIdType).sampleId}
                entityOrcabusId={(val as SampleIdType).sampleOrcabusId}
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

export default CaseSampleTable;
