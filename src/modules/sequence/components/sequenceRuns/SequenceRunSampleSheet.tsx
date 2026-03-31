import { useState, useEffect, useMemo, startTransition } from 'react';
import { useParams } from 'react-router-dom';
import { useSequenceRunAddSampleSheetModel } from '@/api/sequenceRun';
import SampleSheetViewer from '../common/SampleSheetViewer';
import { Button } from '@/components/common/buttons';
import { SampleSheetModel } from '@/utils/samplesheetUtils';
import { DocumentIcon, PlusIcon } from '@heroicons/react/24/outline';
import FileViewDialog from '../common/FileViewDialog';
import SampleSheetUploadDialog from '../common/SampleSheetUploadDialog';
import { classNames } from '@/utils/commonUtils';
import { useSequenceRunContext } from './SequenceRunContext';
import { dayjs } from '@/utils/dayjs';
import toaster from '@/components/common/toaster';
import { useAuthContext } from '@/context/AmplifyAuthContext';
import { useSequenceRunSampleSheetContext } from './SequenceRunSampleSheetContext';
import { BackdropWithText } from '@/components/common/backdrop';
import { sleep } from '@/utils/commonUtils';

const NoSampleSheetFound = () => (
  <div className='flex h-full items-center justify-center rounded-lg border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-900'>
    <div className='flex flex-col items-center gap-3 text-center'>
      <div className='rounded-full bg-gray-100 p-3 dark:bg-gray-800'>
        <DocumentIcon className='h-8 w-8 text-gray-400 dark:text-gray-500' />
      </div>
      <div>
        <h3 className='mb-1 text-base font-medium text-gray-900 dark:text-gray-100'>
          No Sample Sheet Available
        </h3>
        <p className='text-sm text-gray-500 dark:text-gray-400'>
          The sample sheet data for this sequence run could not be found.
        </p>
      </div>
    </div>
  </div>
);

const SequenceRunSampleSheet = () => {
  const { user } = useAuthContext();
  const { instrumentRunId } = useParams();
  const {
    sequenceRunDetail,
    refetchSequenceRunDetail,
    isFetchingSequenceRunDetail,
    refetchSequenceRunComment,
  } = useSequenceRunContext();
  const {
    sequenceRunSampleSheetData,
    isFetchingSequenceRunSampleSheet,
    refetchSequenceRunSampleSheet,
  } = useSequenceRunSampleSheetContext();

  const [isOpenFileViewDialog, setIsOpenFileViewDialog] = useState(false);
  const [isOpenSampleSheetUploadDialog, setIsOpenSampleSheetUploadDialog] = useState(false);
  const [comment, setComment] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const [selectedSamplesheetOrcabusId, setSelectedSamplesheetOrcabusId] = useState<string | null>(
    null
  );
  const selectedSamplesheet = useMemo(() => {
    if (!selectedSamplesheetOrcabusId) return null;
    return sequenceRunSampleSheetData?.find(
      (samplesheet) => samplesheet.orcabusId === selectedSamplesheetOrcabusId
    );
  }, [sequenceRunSampleSheetData, selectedSamplesheetOrcabusId]);

  const handleSelectSamplesheet = (orcabusId: string) => {
    setSelectedSamplesheetOrcabusId(orcabusId);
    setIsOpenFileViewDialog(true);
  };

  // upload samplesheet
  const formData = useMemo(() => {
    const data = new FormData();
    data.append('instrument_run_id', instrumentRunId as string);
    data.append('created_by', user?.email || '');
    return data;
  }, [instrumentRunId, user?.email]);

  useEffect(() => {
    if (file) formData.append('file', file);
    if (comment) formData.append('comment', comment);
  }, [file, comment, formData]);

  const {
    mutate: uploadSequenceRunSampleSheet,
    isError: isErrorUploadSequenceRunSampleSheet,
    isSuccess: isSuccessUploadSequenceRunSampleSheet,
    error: errorUploadSequenceRunSampleSheet,
    reset: resetUploadSequenceRunSampleSheet,
  } = useSequenceRunAddSampleSheetModel({
    body: formData as unknown as {
      file: string;
      instrumentRunId: string;
      createdBy: string;
      comment: string;
    },
  });

  useEffect(() => {
    if (isSuccessUploadSequenceRunSampleSheet) {
      toaster.success({
        title: 'Sample sheet uploaded successfully',
        message: 'Sample sheet uploaded successfully',
      });
      refetchSequenceRunDetail();
      refetchSequenceRunComment();
      // wait for 1 second to ensure the backend is updated
      sleep(1000).then(() => {
        refetchSequenceRunSampleSheet();
      });
      resetUploadSequenceRunSampleSheet();
      startTransition(() => {
        setComment('');
        setFile(null);
      });
    }

    if (isErrorUploadSequenceRunSampleSheet) {
      toaster.error({
        title: 'Error',
        message: 'Failed to upload sample sheet',
      });
      resetUploadSequenceRunSampleSheet();
      startTransition(() => {
        setComment('');
        setFile(null);
      });
    }
  }, [
    isSuccessUploadSequenceRunSampleSheet,
    isErrorUploadSequenceRunSampleSheet,
    errorUploadSequenceRunSampleSheet,
    resetUploadSequenceRunSampleSheet,
    refetchSequenceRunSampleSheet,
    refetchSequenceRunDetail,
    refetchSequenceRunComment,
  ]);

  const handleUploadSamplesheet = () => {
    if (!file) {
      toaster.error({
        title: 'Error',
        message: 'Please select a file to upload',
      });
      return;
    }
    if (!comment) {
      toaster.error({
        title: 'Error',
        message: 'Please enter a comment to upload sample sheet',
      });
      return;
    }

    uploadSequenceRunSampleSheet();
    setIsOpenSampleSheetUploadDialog(false);
  };

  if (
    !sequenceRunSampleSheetData ||
    sequenceRunSampleSheetData.length === 0 ||
    !sequenceRunSampleSheetData[0].sampleSheetContent
  ) {
    return <NoSampleSheetFound />;
  }

  const isFetching = isFetchingSequenceRunSampleSheet || isFetchingSequenceRunDetail;

  if (isFetching) {
    return <BackdropWithText text='Loading sample sheet...' />;
  }

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex flex-col gap-4'>
        <div className='flex flex-col gap-2'>
          <h1 className='text-2xl font-bold'>Sample Sheets</h1>
          <p className='text-sm text-gray-500'>Sample sheets list for this sequence run.</p>
          <div className='flex gap-2'>
            <Button
              type='gray'
              size='sm'
              onClick={() => setIsOpenSampleSheetUploadDialog(true)}
              className={classNames(
                'flex items-center gap-2',
                'border border-gray-200 dark:border-gray-700',
                'text-gray-700 dark:text-gray-300',
                'hover:bg-gray-50 dark:hover:bg-gray-700',
                'rounded-lg px-4 py-2',
                'shadow-xs'
              )}
            >
              <PlusIcon className='h-4 w-4' />
              Add Sample Sheet
            </Button>
          </div>
        </div>
      </div>
      {sequenceRunSampleSheetData
        .sort((a, b) => {
          return dayjs(b.associationTimestamp).diff(dayjs(a.associationTimestamp));
        })
        .map((samplesheet) => (
          <SampleSheetViewer
            key={samplesheet.orcabusId}
            sampleSheetData={samplesheet.sampleSheetContent as SampleSheetModel}
            sampleSheetName={samplesheet.sampleSheetName}
            sampleSheetOrcabusId={samplesheet.orcabusId}
            associatedSequenceRun={sequenceRunDetail?.find(
              (sequenceRun) => sequenceRun.orcabusId === samplesheet.sequence
            )}
            associationTimestamp={samplesheet.associationTimestamp}
            handleSelectSamplesheet={handleSelectSamplesheet}
            comment={samplesheet.comment}
          />
        ))}
      {/* File View Dialog */}
      <FileViewDialog
        isOpenFileViewDialog={isOpenFileViewDialog}
        setIsOpenFileViewDialog={setIsOpenFileViewDialog}
        fileName={selectedSamplesheet?.sampleSheetName ?? ''}
        fileContent={selectedSamplesheet?.sampleSheetContent ?? null}
        isLoading={false}
      />

      <SampleSheetUploadDialog
        instrumentRunId={instrumentRunId as string}
        isOpenSampleSheetUploadDialog={isOpenSampleSheetUploadDialog}
        setIsOpenSampleSheetUploadDialog={setIsOpenSampleSheetUploadDialog}
        comment={comment}
        setComment={setComment}
        setFile={setFile}
        file={file}
        handleUploadSamplesheet={handleUploadSamplesheet}
      />
    </div>
  );
};

export default SequenceRunSampleSheet;
