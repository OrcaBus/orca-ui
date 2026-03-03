/* eslint-disable react-refresh/only-export-components */
// https://github.com/ArnaudBarre/eslint-plugin-react-refresh/issues/25#issuecomment-1729071347

import { lazy, Suspense } from 'react';
import { Outlet, RouteObject } from 'react-router-dom';
import { SpinnerWithText } from '@/components/common/spinner';

const EventsPage = lazy(() => import('@/modules/events/pages/events'));
const WorkflowsPage = lazy(() => import('@/modules/events/pages/workflows'));

export const Router: RouteObject = {
  path: 'diagram',
  element: (
    <div>
      <Suspense fallback={<SpinnerWithText text='Loading ...' />}>
        <Outlet />
      </Suspense>
    </div>
  ),
  children: [
    {
      path: 'events',
      element: <EventsPage />,
    },
    {
      path: 'workflows',
      element: <WorkflowsPage />,
    },
  ],
};
