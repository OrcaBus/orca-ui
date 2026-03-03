// import { useQueryParams } from '@/hooks/useQueryParams';
// import { useEffect } from 'react';

import { LinkTabs } from '@/components/navigation/tabs';
import { Outlet, useLocation } from 'react-router-dom';
import { classNames } from '@/utils/commonUtils';

// const selectedClassName =
//   'inline-flex items-center gap-2 p-4 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 rounded-t-lg font-medium transition-colors duration-200';
// const regularClassName =
//   'inline-flex items-center gap-2 p-4 text-gray-600 dark:text-gray-300 border-b-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-900 dark:hover:text-gray-100 rounded-t-lg cursor-pointer transition-all duration-200';

const WorkflowsPage = () => {
  // const { getQueryParams, setQueryParams } = useQueryParams();
  // const queryParams = getQueryParams();
  // const currentTabSelection = queryParams.tab ?? 'Workflow Runs';
  const pathname = useLocation().pathname;
  // useEffect(() => {
  //   if (!queryParams.tab) {
  //     setQueryParams({ tab: 'Workflow Runs' }, true);
  //   }
  // }, [queryParams.tab, setQueryParams]);
  const basePath = '/workflows';
  const tabs = [
    {
      name: 'Workflow Runs',
      href: `${basePath}/workflowRuns`,
      current: pathname.endsWith('/workflows') || pathname.includes('/workflowRuns'),
    },
    {
      name: 'Analysis Runs',
      href: `${basePath}/analysisRuns`,
      current: pathname.includes('/analysisRuns'),
    },
    {
      name: 'Workflows',
      href: `${basePath}/workflowTypes`,
      current: pathname.includes('/workflowTypes'),
    },
    {
      name: 'Analysis',
      href: `${basePath}/analysisTypes`,
      current: pathname.includes('/analysisTypes'),
    },
  ];

  // const tabs = [
  //   {
  //     label: 'Workflow Runs',
  //     default: true,
  //     content: (
  //       <>
  //         <WorkflowRunsFilterHeader />
  //         <WorkflowRunsTable />
  //       </>
  //     ),
  //   },
  //   {
  //     label: 'Analysis Runs',
  //     default: false,
  //     content: (
  //       <>
  //         <AnalysisRunsFilterHeader />
  //         <AnalysisRunsTable />
  //       </>
  //     ),
  //   },
  //   {
  //     label: 'Workflows',
  //     default: false,
  //     content: (
  //       <>
  //         <WorkflowsFilterHeader />
  //         <WorkflowsTable />
  //       </>
  //     ),
  //   },
  //   {
  //     label: 'Analysis',
  //     default: false,
  //     content: (
  //       <>
  //         <AnalysisFilterHeader />
  //         <AnalysisTable />
  //       </>
  //     ),
  //   },
  // ];

  return (
    <div className={classNames('flex w-full flex-col gap-3', 'bg-white dark:bg-gray-900')}>
      <div className='flex flex-col gap-2 py-2'>
        <LinkTabs tabs={tabs} />
      </div>
      <Outlet />
    </div>
  );
};

export default WorkflowsPage;
