/* eslint-disable react-refresh/only-export-components */
// https://github.com/ArnaudBarre/eslint-plugin-react-refresh/issues/25#issuecomment-1729071347

import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';
import CaseDetailPage from './pages/CaseDetail';
import CaseEditPage from './pages/CaseEdit';
import CaseLayout from './layouts/CaseLayout';
import CaseCreatePage from './pages/CaseCreatePage';

const CasePage = lazy(() => import('@/modules/case/pages/Case'));

export const Router: RouteObject = {
  path: 'case',
  children: [
    {
      path: '',
      element: (
        <CaseLayout>
          <CasePage />
        </CaseLayout>
      ),
    },
    {
      path: 'new',
      element: (
        <CaseLayout>
          <CaseCreatePage />
        </CaseLayout>
      ),
    },
    {
      path: ':caseOrcabusId',
      children: [
        {
          path: '',
          element: (
            <CaseLayout>
              <CaseDetailPage />
            </CaseLayout>
          ),
        },
        {
          path: 'edit',
          element: (
            <CaseLayout>
              <CaseEditPage />
            </CaseLayout>
          ),
        },
      ],
    },
  ],
};
