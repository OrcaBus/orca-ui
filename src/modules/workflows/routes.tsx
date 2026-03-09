import { lazy, Suspense } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import RunsModuleLayout from '@/components/layouts/runs/RunsModuleLayout';
import { RouteObject } from 'react-router-dom';
import { SpinnerWithText } from '@/components/common/spinner';

const WorkflowsPage = lazy(() => import('@/modules/workflows/pages/WorkflowsPage'));
const WorkflowRunsPage = lazy(() => import('@/modules/workflows/pages/WorkflowRunsPage'));
const WorkflowRunsDetailsPage = lazy(() => import('@/modules/workflows/pages/WorkflowRunsDetails'));
const WorkflowRunPortalRedirect = lazy(
  () => import('@/modules/workflows/pages/WorkflowRunPortalRedirect')
);
const AnalysisRunsPage = lazy(() => import('@/modules/workflows/pages/AnalysisRunsPage'));
const AnalysisRunsDetailsPage = lazy(() => import('@/modules/workflows/pages/AnalysisRunsDetails'));
const AnalysisTypesPage = lazy(() => import('@/modules/workflows/pages/AnalysisTypesPage'));
const WorkflowTypesPage = lazy(() => import('@/modules/workflows/pages/WorkflowTypesPage'));

export const Router: RouteObject = {
  path: 'workflows',
  element: (
    <RunsModuleLayout>
      <Suspense fallback={<SpinnerWithText text='Loading Workflows data...' />}>
        <Outlet />
      </Suspense>
    </RunsModuleLayout>
  ),
  children: [
    {
      element: <WorkflowsPage />,
      children: [
        { path: 'workflowRuns', children: [{ path: '', element: <WorkflowRunsPage /> }] },
        { path: 'analysisRuns', children: [{ path: '', element: <AnalysisRunsPage /> }] },
        { path: 'workflowTypes', children: [{ path: '', element: <WorkflowTypesPage /> }] },
        { path: 'analysisTypes', children: [{ path: '', element: <AnalysisTypesPage /> }] },
      ],
    },
    {
      path: 'workflowRuns/portal/:portalRunId',
      element: <WorkflowRunPortalRedirect />,
    },
    { path: 'workflowRuns/:orcabusId', element: <WorkflowRunsDetailsPage /> },
    { path: 'analysisRuns/:orcabusId', element: <AnalysisRunsDetailsPage /> },
    { path: '', element: <Navigate to='workflowRuns' replace /> },
    { path: '*', element: <Navigate to='workflowRuns' replace /> },
  ],
};
