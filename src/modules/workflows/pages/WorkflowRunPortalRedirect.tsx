import { useParams, Navigate } from 'react-router-dom';
import { useWorkflowRunListModel } from '@/api/workflow';
import { SpinnerWithText } from '@/components/common/spinner';

/**
 * Resolves a portal run ID (used by external users) to the internal orcabusId
 * and redirects to the workflow run details page.
 *
 * External users should link to: /workflows/workflowRuns/portal/:portalRunId
 * This page fetches the run by portalRunId and redirects to /workflows/workflowRuns/:orcabusId
 */
const WorkflowRunPortalRedirect = () => {
  const { portalRunId } = useParams<{ portalRunId: string }>();

  const { data, isFetching, isError } = useWorkflowRunListModel({
    params: {
      query: {
        page: 1,
        rowsPerPage: 1,
        portal_run_id: portalRunId ?? undefined,
      },
    },
    reactQuery: {
      enabled: !!portalRunId,
    },
  });

  if (!portalRunId) {
    return <Navigate to='/workflows/workflowRuns' replace />;
  }

  if (isFetching) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <SpinnerWithText text='Resolving workflow run...' />
      </div>
    );
  }

  if (isError || !data?.results?.length) {
    return (
      <div className='flex h-screen flex-col items-center justify-center gap-2 text-gray-600 dark:text-gray-400'>
        <p>Workflow run not found for Portal Run ID: {portalRunId}</p>
        <a
          href='/workflows/workflowRuns'
          className='text-blue-600 hover:underline dark:text-blue-400'
        >
          Back to Workflow Runs
        </a>
      </div>
    );
  }

  const run = data.results[0];
  const orcabusId = run?.orcabusId;
  if (!orcabusId) {
    return (
      <div className='flex h-screen items-center justify-center text-gray-600 dark:text-gray-400'>
        Invalid workflow run data (missing orcabusId).
      </div>
    );
  }

  return <Navigate to={`/workflows/workflowRuns/${orcabusId}`} replace />;
};

export default WorkflowRunPortalRedirect;
