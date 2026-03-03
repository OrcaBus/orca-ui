import { Dialog } from '@/components/common/dialogs';
import { DocumentTextIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { FC, useState } from 'react';
import { classNames } from '@/utils/commonUtils';
import { SpinnerWithText } from '@/components/common/spinner';
import { JsonDisplay } from '@/components/common/json-to-table';
import { jsonToCsv, SampleSheetModel } from '@/utils/samplesheetUtils';
import { ContentTabs } from '@/components/navigation/tabs';
interface FileViewDialogProps {
  isOpenFileViewDialog: boolean;
  setIsOpenFileViewDialog: (isOpen: boolean) => void;
  fileName: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fileContent: Record<string, any> | null;
  isLoading: boolean;
}

const FileViewDialog: FC<FileViewDialogProps> = ({
  isOpenFileViewDialog,
  setIsOpenFileViewDialog,
  fileName,
  fileContent,
  isLoading,
}) => {
  const [selectedTab, setSelectedTab] = useState<'json' | 'csv'>('json');

  const handleDownload = (tab: 'json' | 'csv') => {
    let url: string;
    let a: HTMLAnchorElement;

    if (tab === 'json') {
      const blob = new Blob([JSON.stringify(fileContent, null, 2)], { type: 'application/json' });
      url = window.URL.createObjectURL(blob);
      a = document.createElement('a');
      a.href = url;
      a.download = `${fileName.replace('.csv', '')}.json`; // remove default .csv extension
      document.body.appendChild(a);
      a.click();
      // Delay revoking the URL to ensure download starts
      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 100);
    } else {
      const blob = new Blob([csvFileContent], { type: 'text/csv' });
      url = window.URL.createObjectURL(blob);
      a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      // Delay revoking the URL to ensure download starts
      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 100);
    }
  };

  const csvFileContent = fileContent ? jsonToCsv(fileContent as SampleSheetModel) : '';

  return (
    <Dialog
      title={
        <div className='flex w-full items-center justify-between pr-12'>
          <div className='flex items-center gap-2'>
            <DocumentTextIcon className='h-5 w-5 text-gray-400' />
            <div className='flex flex-col'>
              <h3 className='text-base font-medium text-gray-900 dark:text-gray-100'>{fileName}</h3>
            </div>
          </div>
          <button
            onClick={() => handleDownload(selectedTab)}
            className={classNames(
              'flex items-center gap-2 rounded-md px-3 py-1.5',
              'text-xs font-medium',
              'bg-white dark:bg-gray-800',
              'border border-gray-200 dark:border-gray-700',
              'text-gray-600 dark:text-gray-300',
              'hover:bg-gray-100 dark:hover:bg-gray-700',
              'transition-colors duration-200',
              'group'
            )}
          >
            <ArrowDownTrayIcon
              className={classNames(
                'h-4 w-4',
                'group-hover:text-blue-500 dark:group-hover:text-blue-400',
                'transition-colors duration-200'
              )}
            />
            Download {selectedTab === 'json' ? 'JSON' : 'CSV'}
          </button>
        </div>
      }
      open={isOpenFileViewDialog}
      onClose={() => setIsOpenFileViewDialog(false)}
      size='lg'
      className='bg-gray-100 dark:bg-gray-900'
    >
      <div className={classNames('relative', 'rounded-lg', 'bg-white dark:bg-gray-900')}>
        {isLoading ? (
          <div className='flex h-full w-full items-center justify-center py-4'>
            <SpinnerWithText text='Loading file content...' />
          </div>
        ) : (
          <div
            className={classNames(
              'max-h-[60vh] overflow-auto',
              'scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600',
              'scrollbar-track-transparent'
            )}
          >
            <ContentTabs
              className='overflow-auto rounded-lg bg-white dark:bg-gray-900'
              onChange={(index) => setSelectedTab(index === 0 ? 'json' : 'csv')}
              selectedLabel={selectedTab === 'json' ? 'JSON' : 'CSV'}
              tabs={[
                {
                  label: 'JSON',
                  content: fileContent ? (
                    <JsonDisplay data={fileContent} isFetchingData={isLoading} />
                  ) : (
                    <div className='flex h-full w-full items-center justify-center'>
                      <p>No data available</p>
                    </div>
                  ),
                },
                {
                  label: 'CSV',
                  content: fileContent ? (
                    <div className='overflow-auto rounded-lg bg-white px-4 py-2 dark:bg-gray-900'>
                      <pre>{csvFileContent}</pre>
                    </div>
                  ) : (
                    <div className='flex h-full w-full items-center justify-center'>
                      <p>No data available</p>
                    </div>
                  ),
                },
              ]}
            />
          </div>
        )}
      </div>
    </Dialog>
  );
};

export default FileViewDialog;
