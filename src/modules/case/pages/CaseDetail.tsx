import { useQueryCaseDetailObject } from '@/api/case';
import { Fragment, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQueryParams } from '@/hooks/useQueryParams';
import CaseLibraryTable from '../component/CaseLibrary';
import WorkflowRunTable from '../component/CaseWorkflowRun';
import { SpinnerWithText } from '@/components/common/spinner';
import { Button } from '@/components/common/buttons';
import CaseLinkLibraryButton from '../component/CaseLinkLibraryButton';
import CaseLinkWorkflowRunButton from '../component/CaseLinkWorkflowRunButton';
import CaseDetailDisplay from '../component/CaseDetailDisplay';
import CaseFileViewer from '../component/CaseFileViewer';

const selectedClassName =
  'inline-flex items-center gap-2 p-4 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 rounded-t-lg font-medium transition-colors duration-200';
const regularClassName =
  'inline-flex items-center gap-2 p-4 text-gray-600 dark:text-gray-300 border-b-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-900 dark:hover:text-gray-100 rounded-t-lg cursor-pointer transition-all duration-200';

export const CaseDetailAPITable = () => {
  const navigate = useNavigate();
  const { getQueryParams, setQueryParams } = useQueryParams();
  const currentTabSelection = getQueryParams().tab ?? 'Libraries';
  const { caseOrcabusId } = useParams();
  if (!caseOrcabusId) {
    throw new Error('No case id in URL path!');
  }

  const caseModel = useQueryCaseDetailObject({
    params: { path: { orcabusId: caseOrcabusId } },
  });

  const caseData = caseModel.data;

  const tabs = [
    {
      label: 'Libraries',
      content: (
        <>
          <div className='flex justify-end'>
            <CaseLinkLibraryButton caseOrcabusId={caseOrcabusId} />
          </div>
          <CaseLibraryTable
            externalEntitySet={caseData.externalEntitySet}
            caseOrcabusId={caseOrcabusId}
          />
        </>
      ),
    },
    {
      label: 'WorkflowRun',
      content: (
        <>
          <div className='flex justify-end'>
            <CaseLinkWorkflowRunButton caseOrcabusId={caseOrcabusId} />
          </div>
          <WorkflowRunTable
            externalEntitySet={caseData.externalEntitySet}
            caseOrcabusId={caseOrcabusId}
          />
        </>
      ),
    },
    {
      label: 'Files',
      content: (
        <>
          <CaseFileViewer externalEntitySet={caseData.externalEntitySet} />
        </>
      ),
    },
  ];

  return (
    <>
      {/* Header */}
      <div className='flex flex-wrap items-start justify-between gap-6'>
        <div className='space-y-2'>
          <h1 className='text-2xl font-semibold text-slate-900 dark:text-gray-100'>
            {caseData.title}
          </h1>
        </div>
        <Button
          onClick={() => navigate('./edit')}
          type='primary'
          size='md'
          className='px-6 shadow-sm transition-shadow duration-200 hover:shadow-md'
        >
          Edit
        </Button>
      </div>
      {/* Divider */}
      <div className='my-6 border-t border-slate-200' />
      {/* Meta info grid */}
      <CaseDetailDisplay caseData={caseData} />
      <div className='my-6 border-t border-slate-200' />
      <div className='mb-4'>
        <p className='mb-1 text-xs tracking-wide text-slate-500 uppercase dark:text-gray-400'>
          Case Data
        </p>
        <p className='text-sm font-normal text-slate-500 dark:text-gray-400'>
          View libraries, workflow runs, and files associated with this case.
        </p>
      </div>
      <div className='rounded-lg bg-white dark:bg-gray-900'>
        <div className='border-b border-gray-200 text-sm font-medium dark:border-gray-700'>
          <ul className='-mb-px flex flex-wrap'>
            {tabs.map((tab, index) => {
              const isSelected = currentTabSelection === tab.label;
              return (
                <li key={index}>
                  <div
                    onClick={() => setQueryParams({ tab: tab.label }, true)}
                    className={isSelected ? selectedClassName : regularClassName}
                  >
                    {tab.label.charAt(0).toUpperCase() + tab.label.slice(1)}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
        <div className='mt-2 max-w-full px-2'>
          {tabs.map((tab, index) => {
            if (currentTabSelection === tab.label) {
              return (
                <Fragment key={index}>
                  <Suspense fallback={<SpinnerWithText />}>{tab.content}</Suspense>
                </Fragment>
              );
            }
          })}
        </div>
      </div>
    </>
  );
};

export default function CaseDetailPage() {
  return (
    <div className='flex max-w-full flex-col'>
      <CaseDetailAPITable />
    </div>
  );
}
