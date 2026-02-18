import { DetailedErrorBoundary } from '@/components/common/error';
import SequenceRunTable from '../components/sequenceRuns/SequenceRunTable';
import SequenceRunFilterHeader from '../components/sequenceRuns/SequenceRunFilterHeader';
import { useQueryParams } from '@/hooks/useQueryParams';
import { Fragment, Suspense, useEffect } from 'react';
import { SpinnerWithText } from '@/components/common/spinner';
import SequenceRunListTable from '../components/sequenceRuns/SequenceRunListTable';

const selectedClassName =
  'inline-flex items-center gap-2 p-4 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 rounded-t-lg font-medium transition-colors duration-200';
const regularClassName =
  'inline-flex items-center gap-2 p-4 text-gray-600 dark:text-gray-300 border-b-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-900 dark:hover:text-gray-100 rounded-t-lg cursor-pointer transition-all duration-200';

const SequenceRunsPage = () => {
  const { getQueryParams, setQueryParams } = useQueryParams();
  const queryParams = getQueryParams();
  const currentTabSelection = queryParams.tab ?? 'Sequence';

  useEffect(() => {
    if (!queryParams.tab) {
      setQueryParams({ tab: 'Sequence' }, true);
    }
  }, [queryParams.tab, setQueryParams]);

  // sanitise to remove tab from query params
  const passInQueryParams = { ...queryParams };
  delete passInQueryParams.tab;
  const tabs = [
    {
      label: 'Sequence',
      default: true,
      content: <SequenceRunListTable />,
    },
    {
      label: 'Sequence Runs',
      default: false,
      content: <SequenceRunTable />,
    },
  ];

  return (
    <DetailedErrorBoundary errorTitle='Unable to load recent sequence runs data'>
      <div className='h-full w-full'>
        {/* <div className='text-2xl font-bold py-2'>Sequence</div> */}
        <SequenceRunFilterHeader />

        {/* tabs for sequence tabs */}
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
      </div>
    </DetailedErrorBoundary>
  );
};

export default SequenceRunsPage;
