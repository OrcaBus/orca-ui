import { FC, useMemo } from 'react';
import { HeaderModel, ReadsModel, SampleSheetModel } from '@/utils/samplesheetUtils';
import { ListTable } from '@/components/tables';
import { classNames, formatSpaceCase } from '@/utils/commonUtils';
import { EyeIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/common/buttons';
import { Accordion } from '@/components/common/accordion';
import { useSequenceRunDetailModel, useSequenceRunCommentListModel } from '@/api/sequenceRun';
import { dayjs, TIMESTAMP_FORMAT } from '@/utils/dayjs';
import {
  DocumentTextIcon,
  ChatBubbleLeftEllipsisIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';

interface SampleSheetViewerProps {
  sampleSheetData: SampleSheetModel;
  sampleSheetName: string;
  sampleSheetOrcabusId: string;
  associatedSequenceRun: ReturnType<typeof useSequenceRunDetailModel>['data'];
  associationTimestamp: string;
  handleSelectSamplesheet: (orcabusId: string) => void;
  comment:
    | NonNullable<ReturnType<typeof useSequenceRunCommentListModel>['data']>[number]
    | undefined;
}

const SampleSheetViewer: FC<SampleSheetViewerProps> = ({
  sampleSheetData,
  sampleSheetName,
  sampleSheetOrcabusId,
  associatedSequenceRun,
  associationTimestamp,
  handleSelectSamplesheet,
  comment,
}) => {
  const {
    header,
    reads,
    sequencing,
    cloudSettings,
    cloudData,
    bclconvertSettings,
    bclconvertData,
    tso500lSettings,
    tso500lData,
    cloudTSO500LSettings,
    cloudTSO500LData,
    tso500sSettings,
    tso500sData,
    cloudTSO500SSettings,
    cloudTSO500SData,
  } = sampleSheetData;

  const settingsAndDataSections = useMemo(
    () => [
      {
        title: 'BaseSpace',
        settings: cloudSettings,
        data: cloudData,
      },
      {
        title: 'B C L Convert',
        settings: bclconvertSettings,
        data: bclconvertData,
      },

      {
        title: 'TSO500L',
        settings: tso500lSettings,
        data: tso500lData,
      },
      {
        title: 'TSO500S',
        settings: tso500sSettings,
        data: tso500sData,
      },
      {
        title: 'Cloud TSO500L',
        settings: cloudTSO500LSettings,
        data: cloudTSO500LData,
      },
      {
        title: 'Cloud TSO500S',
        settings: cloudTSO500SSettings,
        data: cloudTSO500SData,
      },
    ],
    [
      cloudSettings,
      cloudData,
      bclconvertSettings,
      bclconvertData,
      tso500lSettings,
      tso500lData,
      tso500sSettings,
      tso500sData,
      cloudTSO500LSettings,
      cloudTSO500LData,
      cloudTSO500SSettings,
      cloudTSO500SData,
    ]
  );

  // const [isOpenFileViewDialog, setIsOpenFileViewDialog] = useState(false);

  return (
    <div className='flex flex-col gap-6'>
      {/* Header with Title and Actions */}
      <Accordion
        title={
          <div className='flex w-full items-start justify-between gap-4 rounded-lg'>
            {/* Title */}
            <div className='flex flex-col items-start gap-2'>
              {/* Main Title */}
              <div className='flex items-center gap-3'>
                <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30'>
                  <DocumentTextIcon className='h-4 w-4 text-blue-600 dark:text-blue-400' />
                </div>
                <div>
                  <h2 className='text-xl font-semibold text-gray-900 dark:text-white'>
                    {sampleSheetName || 'Sample Sheet'}
                  </h2>
                  <div className='flex items-center gap-2'>
                    <div className='text-xs text-gray-500 dark:text-gray-400'>Sequence Run ID</div>
                    <div className='flex items-center gap-1'>
                      <span className='overflow-hidden text-sm font-bold text-gray-900 dark:text-white'>
                        {associatedSequenceRun?.sequenceRunId || 'Unknown'}
                      </span>
                    </div>
                    <div className='text-xs text-gray-500 dark:text-gray-400'>
                      {dayjs(associationTimestamp).format(TIMESTAMP_FORMAT) || 'Unknown'}
                    </div>
                  </div>
                </div>
              </div>
              {/* Comment */}
              <div className='w-full'>
                {/* Comment */}
                {comment && (
                  <div className='group flex w-full items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 shadow-sm transition-all duration-200 hover:border-blue-200 hover:bg-blue-50 dark:border-gray-700 dark:bg-gray-800/50 dark:hover:border-blue-800 dark:hover:bg-blue-900/20'>
                    <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-gray-200 shadow-sm transition-all duration-200 group-hover:bg-blue-200 dark:bg-gray-700 dark:group-hover:bg-blue-800'>
                      <ChatBubbleLeftEllipsisIcon className='h-4 w-4 text-gray-600 transition-colors duration-200 group-hover:text-blue-600 dark:text-gray-400 dark:group-hover:text-blue-400' />
                    </div>
                    <div className='flex flex-col gap-1'>
                      <div className='flex items-center gap-2'>
                        <span className='text-xs font-semibold tracking-wide text-gray-600 uppercase dark:text-gray-400'>
                          Comment
                        </span>
                        <div className='flex items-center gap-1'>
                          <UserCircleIcon className='h-4 w-4 text-gray-500' />
                          <span className='text-xs text-gray-500 dark:text-gray-400'>
                            {comment?.createdBy || 'Unknown'}
                          </span>
                        </div>
                        <div className='flex items-center gap-1.5'>
                          <svg
                            className='h-4 w-4 text-gray-400'
                            fill='none'
                            viewBox='0 0 24 24'
                            stroke='currentColor'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                            />
                          </svg>
                          <span className='text-xs text-gray-500 dark:text-gray-400'>
                            {dayjs(comment?.createdAt).format(TIMESTAMP_FORMAT) || 'Unknown'}
                          </span>
                        </div>
                      </div>
                      <p className='line-clamp-2 text-sm leading-relaxed font-medium text-gray-900 dark:text-white'>
                        {comment?.comment || 'No comment provided'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className='flex items-center gap-4'>
              <Button
                type='gray'
                size='xs'
                rounded
                onClick={(e) => {
                  e.preventDefault();
                  handleSelectSamplesheet(sampleSheetOrcabusId);
                }}
                className={classNames(
                  'flex items-center gap-2',
                  'border border-gray-200 dark:border-gray-700',
                  'text-gray-700 dark:text-gray-300',
                  'hover:bg-gray-50 dark:hover:bg-gray-700',
                  'rounded-lg px-4 py-2',
                  'shadow-xs'
                )}
              >
                <EyeIcon className='h-4 w-4' />
                View Raw File
              </Button>
            </div>
          </div>
        }
        defaultOpen={false}
        className='rounded-lg'
        buttonClassName='rounded-lg'
        showChevron={false}
        chevronPosition='right'
      >
        <div className='flex flex-col gap-6 px-2'>
          <div className='min-w-fit rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:shadow-gray-900/30'>
            <div className='grid grid-cols-3 gap-4 p-6'>
              <div className='col-span-2 grid grid-cols-3 gap-2 border-r border-gray-200 dark:border-gray-700'>
                {Object.keys(header).map((key, idx) => (
                  <div
                    key={idx}
                    className={classNames(
                      key === 'runName' || key === 'runDescription' ? 'col-span-2' : 'col-span-1'
                    )}
                  >
                    <h3 className='text-sm font-medium text-gray-500 dark:text-gray-400'>
                      {formatSpaceCase(key)}
                    </h3>
                    <p className='mt-1 text-lg font-medium text-gray-900 dark:text-white'>
                      {header[key as keyof HeaderModel]}
                    </p>
                  </div>
                ))}
              </div>

              <div className='col-span-1 grid grid-cols-2 gap-2 px-2'>
                {Object.keys(reads).map((key, idx) => (
                  <div key={idx}>
                    <h3 className='text-sm font-medium text-gray-500 dark:text-gray-400'>
                      {formatSpaceCase(key)}
                    </h3>
                    <p className='mt-1 text-lg font-medium text-gray-900 dark:text-white'>
                      {reads[key as keyof ReadsModel]}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Sequence Run Section */}
          {sequencing && (
            <div className='rounded-lg bg-white shadow-sm'>
              <div className='p-6'>
                <h2 className='mb-4 text-lg font-medium text-gray-700'>Sequence Run</h2>
              </div>
            </div>
          )}

          {/* Settings and Data Sections */}
          {settingsAndDataSections.map((section, idx) => (
            <div key={idx}>
              {section.settings && (
                <div className='rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:shadow-gray-900/30'>
                  <div className='p-6'>
                    <h2 className='mb-4 text-lg font-medium text-gray-700 dark:text-gray-200'>
                      {section.title}
                    </h2>
                    <div className='grid grid-cols-4 gap-4'>
                      {Object.keys(section.settings).map((key, idx) => (
                        <div
                          key={idx}
                          className={classNames(
                            'rounded-lg bg-gray-50 p-4 dark:bg-gray-800',
                            key.endsWith('Pipeline') || key == 'urn' ? 'col-span-2' : 'col-span-1'
                          )}
                        >
                          <h3 className='text-sm font-medium text-gray-500 dark:text-gray-400'>
                            {formatSpaceCase(key)}
                          </h3>
                          <p className='mt-1 overflow-hidden text-sm text-gray-900 dark:text-gray-100'>
                            {section.settings?.[key as keyof typeof section.settings] || ''}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Table Section */}
                  <div className='w-full overflow-x-auto'>
                    <div className='min-w-fit'>
                      <ListTable data={section.data as Record<string, number | string>[]} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </Accordion>
    </div>
  );
};

export default SampleSheetViewer;
