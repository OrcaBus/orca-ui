import { useMemo } from 'react';
import { useSequenceRunContext } from './SequenceRunContext';
import { Sidebar } from '@/components/common/sidebar';
import { AccordionList } from '@/components/common/accordion';
import { dayjs } from '@/utils/dayjs';

const SequenceRunDetailsSidebar = () => {
  const { sequenceRunDetail } = useSequenceRunContext();
  // format data and disply in the table

  const lastSequenceRunDetail = useMemo(() => {
    return sequenceRunDetail
      ?.filter((detail) => detail.status !== null)
      ?.sort((a, b) => {
        return dayjs(a.startTime).isAfter(dayjs(b.startTime)) ? -1 : 1;
      })[0];
  }, [sequenceRunDetail]);

  const sequenceRunDetailsData = useMemo(
    () =>
      lastSequenceRunDetail
        ? {
            sequenceRunInfo: [
              {
                key: 'instrumentRunId',
                value: lastSequenceRunDetail.instrumentRunId,
              },
              {
                key: 'sequenceRunId',
                value: lastSequenceRunDetail.sequenceRunId,
              },
              {
                key: 'experimentName',
                value: lastSequenceRunDetail.experimentName,
              },
              {
                key: 'icaProjectId',
                value: lastSequenceRunDetail.icaProjectId,
              },
            ],
            runDetails: [
              {
                key: 'runStatus',
                value: lastSequenceRunDetail.status,
              },
              {
                key: 'runVolumeName',
                value: lastSequenceRunDetail.runVolumeName,
              },
              {
                key: 'runFolderPath',
                value: lastSequenceRunDetail.runFolderPath,
              },
              {
                key: 'runDataUri',
                value: lastSequenceRunDetail.runDataUri,
              },
              {
                key: 'startTime',
                value: lastSequenceRunDetail.startTime,
              },
              {
                key: 'endTime',
                value: lastSequenceRunDetail.endTime,
              },
            ],
            runProperties: [
              // {
              //   key: 'apiUrl',
              //   value: sequenceRunDetail.apiUrl,
              // },
              {
                key: 'flowcellBarcode',
                value: lastSequenceRunDetail.flowcellBarcode,
              },
              {
                key: 'reagentBarcode',
                value: lastSequenceRunDetail.reagentBarcode,
              },
              {
                key: 'sampleSheetName',
                value: lastSequenceRunDetail.sampleSheetName,
              },
              {
                key: 'v1pre3Id',
                value: lastSequenceRunDetail.v1pre3Id,
              },
            ],
          }
        : null,
    [lastSequenceRunDetail]
  );

  return (
    <Sidebar
      position='right'
      className='border-r-0'
      preferenceStorageKey='workflow-run-details-sidebar'
      openWidth='w-100'
    >
      <div className='mt-14'>
        {sequenceRunDetailsData ? (
          <div className='space-y-2'>
            <AccordionList
              title='Run Info'
              data={sequenceRunDetailsData?.sequenceRunInfo || []}
              defaultOpen={true}
              chevronPosition='right'
              buttonClassName='border-b  border-gray-200 dark:border-gray-700'
            />

            <AccordionList
              title='Run Details'
              data={sequenceRunDetailsData?.runDetails || []}
              defaultOpen={true}
              chevronPosition='right'
              buttonClassName='border-b border-gray-200 dark:border-gray-700'
            />

            <AccordionList
              title='Run Properties'
              data={sequenceRunDetailsData?.runProperties || []}
              defaultOpen={false}
              chevronPosition='right'
              buttonClassName='border-b border-gray-200 dark:border-gray-700'
            />
          </div>
        ) : (
          <div className='flex h-full items-center justify-center'>No data</div>
        )}
      </div>
    </Sidebar>
  );
};

export default SequenceRunDetailsSidebar;
