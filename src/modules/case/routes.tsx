/* eslint-disable react-refresh/only-export-components */
// https://github.com/ArnaudBarre/eslint-plugin-react-refresh/issues/25#issuecomment-1729071347

import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';
import CaseDetailPage from './pages/CaseDetail';
import { DetailedErrorBoundary } from '@/components/common/error';
import CaseEditPage from './pages/CaseEdit';

const CasePage = lazy(() => import('@/modules/case/pages/Case'));

export const Router: RouteObject = {
  path: 'case',
  children: [
    { path: '', element: <CasePage /> },
    {
      path: ':caseOrcabusId',
      children: [
        {
          path: '',
          element: (
            <DetailedErrorBoundary>
              <CaseDetailPage />
            </DetailedErrorBoundary>
          ),
        },
        {
          path: 'edit',
          element: (
            <DetailedErrorBoundary>
              <CaseEditPage />
            </DetailedErrorBoundary>
          ),
        },
      ],
    },
  ],
};
