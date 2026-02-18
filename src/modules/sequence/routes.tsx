/* eslint-disable react-refresh/only-export-components */
// https://github.com/ArnaudBarre/eslint-plugin-react-refresh/issues/25#issuecomment-1729071347

import { lazy, Suspense } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import RunsModuleLayout from '@/components/layouts/runs/RunsModuleLayout';
import { RouteObject } from 'react-router-dom';
import { SpinnerWithText } from '@/components/common/spinner';

const SequenceRunsPage = lazy(() => import('@/modules/sequence/pages/SequenceRunsPage'));
const SequenceRunDetailsPage = lazy(
  () => import('@/modules/sequence/pages/SequenceRunDetailsPage')
);
const SequenceRunDetails = lazy(() => import('@/modules/sequence/pages/SequenceRunDetails'));
const SequenceRunSampleSheets = lazy(
  () => import('@/modules/sequence/pages/SequenceRunSampleSheets')
);
const SequenceRunWorkflowRuns = lazy(
  () => import('@/modules/sequence/pages/SequenceRunWorkflowRuns')
);

export const Router: RouteObject = {
  path: 'sequence',
  element: (
    <RunsModuleLayout>
      <Suspense fallback={<SpinnerWithText text='Loading Sequence data...' />}>
        <Outlet />
      </Suspense>
    </RunsModuleLayout>
  ),
  children: [
    {
      path: '',
      element: <SequenceRunsPage />,
    },
    {
      path: ':instrumentRunId',
      element: <SequenceRunDetailsPage />,
      children: [
        { path: '', element: <Navigate to='details' replace /> },
        { path: 'details', element: <SequenceRunDetails /> },
        { path: 'samplesheet', element: <SequenceRunSampleSheets /> },
        { path: 'workflowruns', element: <SequenceRunWorkflowRuns /> },
      ],
    },
  ],
};
