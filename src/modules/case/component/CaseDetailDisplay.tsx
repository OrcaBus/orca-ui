import React from 'react';
import { dayjs, TIMESTAMP_FORMAT } from '@/utils/dayjs';
import { components } from '@/api/types/case';

function CaseDetailDisplay({ caseData }: { caseData: components['schemas']['CaseDetail'] }) {
  return (
    <div className='grid grid-cols-1 gap-6 text-sm sm:grid-cols-2 lg:grid-cols-3'>
      <div>
        <p className='mb-1 text-xs tracking-wide text-slate-500 uppercase dark:text-gray-400'>
          Case ID
        </p>
        <p className='font-medium text-slate-800 dark:text-gray-200'>{caseData.orcabusId}</p>
      </div>

      <div>
        <p className='mb-1 text-xs tracking-wide text-slate-500 uppercase dark:text-gray-400'>
          Last Modified
        </p>
        <p className='font-medium text-slate-800 dark:text-gray-200'>
          {dayjs(caseData.lastModified).format(TIMESTAMP_FORMAT)}
        </p>
      </div>
      <div>
        <p className='mb-1 text-xs tracking-wide text-slate-500 uppercase dark:text-gray-400'>
          Creation Status
        </p>
        <p className='font-medium text-slate-800 dark:text-gray-200'>{caseData.creationStatus}</p>
      </div>
      <div>
        <p className='mb-1 text-xs tracking-wide text-slate-500 uppercase dark:text-gray-400'>
          Alias
        </p>
        {caseData.alias && caseData.alias.length > 0 ? (
          <ul className='list-disc space-y-1 pl-5'>
            {caseData.alias.map((item, index) => (
              <li key={index} className='font-medium text-slate-800 dark:text-gray-200'>
                {item}
              </li>
            ))}
          </ul>
        ) : (
          <p className='font-medium text-slate-800 dark:text-gray-200'>-</p>
        )}
      </div>
      <div>
        <p className='mb-1 text-xs tracking-wide text-slate-500 uppercase dark:text-gray-400'>
          Type
        </p>
        <p className='font-medium text-slate-800 dark:text-gray-200'>{caseData.type ?? '-'}</p>
      </div>

      <div>
        <p className='mb-1 text-xs tracking-wide text-slate-500 uppercase dark:text-gray-400'>
          Description
        </p>
        <p className='font-medium text-slate-800 dark:text-gray-200'>
          {caseData.description ?? '-'}
        </p>
      </div>
      <div>
        <p className='mb-1 text-xs tracking-wide text-slate-500 uppercase dark:text-gray-400'>
          Trello URL
        </p>
        <p className='font-medium text-slate-800 dark:text-gray-200'>{caseData.trelloUrl ?? '-'}</p>
      </div>
    </div>
  );
}

export default CaseDetailDisplay;
