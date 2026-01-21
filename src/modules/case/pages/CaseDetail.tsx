import { useQueryCaseDetailObject } from '@/api/case';
import { Fragment, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQueryParams } from '@/hooks/useQueryParams';
import CaseLibraryTable from '../component/CaseLibrary';
import WorkflowRunTable from '../component/CaseWorkflowRun';
import { SpinnerWithText } from '@/components/common/spinner';
import { Button } from '@/components/common/buttons';

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
        <CaseLibraryTable
          externalEntitySet={caseData.externalEntitySet}
          caseOrcabusId={caseOrcabusId}
        />
      ),
    },
    {
      label: 'WorkflowRun',
      content: (
        <WorkflowRunTable
          externalEntitySet={caseData.externalEntitySet}
          caseOrcabusId={caseOrcabusId}
        />
      ),
    },
  ];

  return (
    <>
      {/* Header */}
      <div className='flex flex-wrap items-start justify-between gap-6'>
        <div className='space-y-2'>
          <h1 className='text-2xl font-semibold text-slate-900'>{caseData.title}</h1>
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
      <div className='grid grid-cols-1 gap-6 text-sm sm:grid-cols-2 lg:grid-cols-3'>
        <div>
          <p className='mb-1 text-xs tracking-wide text-slate-500 uppercase'>Case ID</p>
          <p className='font-medium text-slate-800'>{caseData.orcabusId}</p>
        </div>

        <div>
          <p className='mb-1 text-xs tracking-wide text-slate-500 uppercase'>Last Modified</p>
          <p className='font-medium text-slate-800'>{caseData.lastModified}</p>
        </div>
        <div>
          <p className='mb-1 text-xs tracking-wide text-slate-500 uppercase'>Creation Status</p>
          <p className='font-medium text-slate-800'>{caseData.creationStatus}</p>
        </div>
        <div>
          <p className='mb-1 text-xs tracking-wide text-slate-500 uppercase'>Trello URL</p>
          <p className='font-medium text-slate-800'>{caseData.trelloUrl ?? '-'}</p>
        </div>
        <div>
          <p className='mb-1 text-xs tracking-wide text-slate-500 uppercase'>Type</p>
          <p className='font-medium text-slate-800'>{caseData.type ?? '-'}</p>
        </div>

        <div>
          <p className='mb-1 text-xs tracking-wide text-slate-500 uppercase'>Description</p>
          <p className='font-medium text-slate-800'>{caseData.description}</p>
        </div>
      </div>

      <div className='my-6 border-t border-slate-200' />

      <div className='mb-4'>
        <p className='mb-1 text-xs tracking-wide text-slate-500 uppercase'>External Entities</p>
        <p className='text-sm font-normal text-slate-500'>
          This case is linked to external entities of different types. Below, you can view
          associated workflow runs and libraries.
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
        <div className='mt-2 px-2'>
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
  const navigate = useNavigate();

  return (
    <div className='flex max-w-full flex-col p-6'>
      <h1 className='mb-4 cursor-pointer font-bold text-blue-500' onClick={() => navigate('/case')}>
        Case
      </h1>
      <CaseDetailAPITable />
    </div>
  );
}
