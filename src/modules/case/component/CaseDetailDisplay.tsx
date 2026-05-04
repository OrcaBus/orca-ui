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
          Study Type
        </p>
        <p className='font-medium text-slate-800 dark:text-gray-200'>{caseData.studyType ?? '-'}</p>
      </div>
      <div>
        <p className='mb-1 text-xs tracking-wide text-slate-500 uppercase dark:text-gray-400'>
          Links
        </p>
        {caseData.links && Object.keys(caseData.links).length > 0 ? (
          <ul className='list-disc space-y-1 pl-5'>
            {Object.entries(caseData.links).map(([name, url]) => (
              <li key={name} className='font-medium text-slate-800 dark:text-gray-200'>
                <a
                  href={url as string}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-blue-600 hover:underline dark:text-blue-400'
                >
                  {name}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className='font-medium text-slate-800 dark:text-gray-200'>-</p>
        )}
      </div>
      <div>
        <p className='mb-1 text-xs tracking-wide text-slate-500 uppercase dark:text-gray-400'>
          Report Required
        </p>
        <p className='font-medium text-slate-800 dark:text-gray-200'>
          {caseData.isReportRequired ? 'Yes' : 'No'}
        </p>
      </div>

      <div>
        <p className='mb-1 text-xs tracking-wide text-slate-500 uppercase dark:text-gray-400'>
          NATA Accredited
        </p>
        <p className='font-medium text-slate-800 dark:text-gray-200'>
          {caseData.isNataAccredited === undefined ? '-' : caseData.isNataAccredited ? 'Yes' : 'No'}
        </p>
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
          Last Status
        </p>
        <p className='font-medium text-slate-800 dark:text-gray-200'>
          {caseData.latestState ? caseData.latestState.status : '-'}
        </p>
      </div>
    </div>
  );
}

export default CaseDetailDisplay;
