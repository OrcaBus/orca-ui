import { useEffect, useMemo, useState, startTransition } from 'react';
import { useParams } from 'react-router-dom';
import {
  useWorkflowRunRerunModel,
  useWorkflowRunStateCreateModel,
  useWorkflowRunCommentCreateModel,
} from '@/api/workflow';
import Skeleton from 'react-loading-skeleton';
import toaster from '@/components/common/toaster';
import { useWorkflowRunsContext } from './WorkflowRunsContext';
import { useAuthContext } from '@/context/AmplifyAuthContext';
import { Button } from '@/components/common/buttons';
import { ChatBubbleLeftRightIcon, PlusIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import RerunDialog from '../common/RerunDialog';
import CommentDialog from '../common/CommentDialog';
import StateDialog from '../common/StateDialog';
import { classNames } from '@/utils/commonUtils';

const WorkflowRunsDetailsHeader = () => {
  const { user } = useAuthContext();
  const { orcabusId } = useParams();
  const {
    setRefreshWorkflowRuns,
    workflowRunDetail,
    isFetchingWorkflowRunDetail,
    refetchWorkflowComment,
    refetchWorkflowState,
    workflowRunStateCreationValidMapData,
    isFetchingWorkflowRunStateCreationValidMap,
    workflowRunRerunValidMapData,
    isFetchingWorkflowRunRerunValidMap,
  } = useWorkflowRunsContext();

  // rerun workflow dialog
  const [isOpenRerunWorkflowDialog, setIsOpenRerunWorkflowDialog] = useState<boolean>(false);
  const [isDeprecated, setIsDeprecated] = useState<boolean>(false);
  const [selectedDataset, setSelectedDataset] = useState<string | null>(null);

  // comment dialog
  const [isOpenAddCommentDialog, setIsOpenAddCommentDialog] = useState<boolean>(false);
  const [comment, setComment] = useState<string>('');

  // state dialog
  const [isOpenAddStateDialog, setIsOpenAddStateDialog] = useState<boolean>(false);
  const [stateStatus, setStateStatus] = useState<string | null>(null);
  const [stateComment, setStateComment] = useState<string>('');

  const {
    mutate: rerunWorkflow,
    isSuccess: isRerunWorkflowSuccess,
    isError: isErrorRerunWorkflow,
    reset: resetRerunWorkflow,
    error: rerunWorkflowError,
  } = useWorkflowRunRerunModel({
    params: { path: { orcabusId: orcabusId as string } },
    body: {
      dataset: selectedDataset,
    },
    reactQuery: {
      enabled: !!orcabusId,
    },
  });

  const workflowLastState = workflowRunDetail?.currentState?.status;

  // find all valid state transition options
  // Handles three formats:
  // 1. Array: ['STATE1', 'STATE2'] - only these states can transition to the key
  // 2. Dict with 'excludedStates': allows all states except those listed
  // 3. Dict with 'allowedStates': same as array format
  // Special case: when workflowLastState is empty/null, states with excludedStates
  // that don't exclude empty/null will be allowed (e.g., DEPRECATED)
  const validState = useMemo(() => {
    if (!workflowRunStateCreationValidMapData) {
      return [];
    }

    // Handle empty/null state: treat as empty string for comparison
    // This allows states with excluded_states to permit empty workflows
    const currentState =
      workflowLastState && typeof workflowLastState === 'string' ? workflowLastState : '';

    return Object.entries(workflowRunStateCreationValidMapData)
      .filter(([, value]) => {
        // Handle array format: ['STATE1', 'STATE2']
        // Only matches if currentState is explicitly in the array
        if (Array.isArray(value)) {
          return value.includes(currentState);
        }

        // Handle dict format
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          const dictValue = value as Record<string, unknown>;

          // Handle 'excluded_states': allows all states except those listed
          // If currentState is empty and not in excluded list, it's allowed
          // This enables empty workflows to transition to states like DEPRECATED
          if ('excludedStates' in dictValue) {
            const excludedStates = dictValue.excludedStates;
            if (Array.isArray(excludedStates)) {
              // Check if currentState (or empty string for null) is in excluded list
              return !excludedStates.includes(currentState);
            }
            return false;
          }

          // Handle 'allowed_states': same as array format
          // Only matches if currentState is explicitly in the allowed list
          if ('allowedStates' in dictValue) {
            const allowedStates = dictValue.allowedStates;
            if (Array.isArray(allowedStates)) {
              return allowedStates.includes(currentState);
            }
            return false;
          }
        }
        return false;
      })
      .map(([key]) => key);
  }, [workflowRunStateCreationValidMapData, workflowLastState]);

  const {
    mutate: createWorkflowRunComment,
    isSuccess: isCreatedWorkflowRunComment,
    isError: isErrorCreatingWorkflowRunComment,
    reset: resetCreateWorkflowRunComment,
  } = useWorkflowRunCommentCreateModel({
    params: { path: { orcabusId: orcabusId as string } },
    body: {
      comment: comment,
      createdBy: user?.email,
    },
  });

  const handleAddComment = () => {
    createWorkflowRunComment();
    setIsOpenAddCommentDialog(false);
  };

  useEffect(() => {
    if (isCreatedWorkflowRunComment) {
      toaster.success({ title: 'Comment added successfully' });
      refetchWorkflowComment();
      resetCreateWorkflowRunComment();
      startTransition(() => {
        setComment('');
      });
    }

    if (isErrorCreatingWorkflowRunComment) {
      toaster.error({ title: 'Error adding comment' });
      resetCreateWorkflowRunComment();
    }
  }, [
    isCreatedWorkflowRunComment,
    isErrorCreatingWorkflowRunComment,
    refetchWorkflowComment,
    resetCreateWorkflowRunComment,
  ]);

  const {
    mutate: createWorkflowRunState,
    isSuccess: isCreatedWorkflowRunState,
    isError: isErrorCreatingWorkflowRunState,
    reset: resetCreateWorkflowRunState,
  } = useWorkflowRunStateCreateModel({
    params: { path: { orcabusId: orcabusId as string } },
    body: {
      status: stateStatus,
      comment: stateComment,
      createdBy: user?.email,
    },
  });

  const handleStateCreationEvent = () => {
    createWorkflowRunState();
    setIsOpenAddStateDialog(false);
  };
  useEffect(() => {
    if (isCreatedWorkflowRunState) {
      toaster.success({ title: 'State added' });
      refetchWorkflowState();
      resetCreateWorkflowRunState();
      startTransition(() => {
        setStateStatus(null);
        setStateComment('');
      });
    }

    if (isErrorCreatingWorkflowRunState) {
      toaster.error({ title: 'Error adding state status' });
      resetCreateWorkflowRunState();
    }
  }, [
    isCreatedWorkflowRunState,
    refetchWorkflowState,
    resetCreateWorkflowRunState,
    isErrorCreatingWorkflowRunState,
  ]);

  const handleRerunWorkflow = () => {
    rerunWorkflow();
    if (isDeprecated) {
      handleMarkAsDeprecated();
    }
    setIsOpenRerunWorkflowDialog(false);
  };

  useEffect(() => {
    if (isRerunWorkflowSuccess) {
      toaster.success({ title: 'Workflow rerun successfully' });
      startTransition(() => {
        setIsOpenRerunWorkflowDialog(false);
        setSelectedDataset(null);
        setIsDeprecated(false);
      });
      resetRerunWorkflow();
      setRefreshWorkflowRuns(true);
    }
    if (isErrorRerunWorkflow) {
      toaster.error({ title: 'Error rerunning workflow', message: rerunWorkflowError?.message });
      startTransition(() => {
        setIsOpenRerunWorkflowDialog(false);
        setSelectedDataset(null);
        setIsDeprecated(false);
      });
      resetRerunWorkflow();
    }
  }, [
    isRerunWorkflowSuccess,
    isErrorRerunWorkflow,
    rerunWorkflowError,
    resetRerunWorkflow,
    setRefreshWorkflowRuns,
  ]);

  const handleMarkAsDeprecated = () => {
    createWorkflowRunState();
  };

  useEffect(() => {
    if (isCreatedWorkflowRunState) {
      toaster.success({ title: `Workflow run marked as ${stateStatus}` });
      resetCreateWorkflowRunState();
    }
    if (isErrorCreatingWorkflowRunState) {
      toaster.error({ title: `Error marking workflow run as ${stateStatus}` });
      resetCreateWorkflowRunState();
    }
  }, [
    isCreatedWorkflowRunState,
    resetCreateWorkflowRunState,
    isErrorCreatingWorkflowRunState,
    stateStatus,
  ]);

  const handleCloseRerunWorkflowDialog = () => {
    setIsOpenRerunWorkflowDialog(false);
    resetRerunWorkflow();
    setSelectedDataset(null);
    setIsDeprecated(false);
  };

  return (
    <div className={classNames('flex w-full flex-col gap-3', 'bg-white dark:bg-gray-900')}>
      {/* header: workflow run name */}
      {isFetchingWorkflowRunDetail ||
      isFetchingWorkflowRunStateCreationValidMap ||
      isFetchingWorkflowRunRerunValidMap ? (
        <div className='flex-1'>
          <Skeleton height={20} />
        </div>
      ) : (
        <div>
          <div className='flex items-center justify-between py-4'>
            <div className='flex flex-col'>
              <h1 className='truncate text-xl font-semibold text-gray-900 dark:text-white'>
                {workflowRunDetail?.workflowRunName}
              </h1>
            </div>
          </div>
          <div className='flex flex-col gap-2 py-2'>
            <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>Workflow Run Actions</p>
            <div className='flex flex-wrap items-center gap-2'>
              <Button
                type='gray'
                size='xs'
                rounded
                onClick={() => setIsOpenRerunWorkflowDialog(true)}
                disabled={isFetchingWorkflowRunRerunValidMap}
                className={classNames(
                  'flex items-center gap-2',
                  'border border-gray-200 dark:border-gray-700',
                  'text-gray-700 dark:text-gray-300',
                  'hover:bg-gray-50 dark:hover:bg-gray-700',
                  'rounded-lg px-4 py-2',
                  'shadow-xs'
                )}
              >
                <ArrowPathIcon className='h-4 w-4' />
                Rerun
              </Button>

              <Button
                type='gray'
                size='xs'
                rounded
                onClick={() => setIsOpenAddStateDialog(true)}
                disabled={isFetchingWorkflowRunRerunValidMap}
                className={classNames(
                  'flex items-center gap-2',
                  'border border-gray-200 dark:border-gray-700',
                  'text-gray-700 dark:text-gray-300',
                  'hover:bg-gray-50 dark:hover:bg-gray-700',
                  'rounded-lg px-4 py-2',
                  'shadow-xs'
                )}
              >
                <PlusIcon className='h-4 w-4' />
                Add New State
              </Button>

              <Button
                type='gray'
                size='xs'
                rounded
                onClick={() => setIsOpenAddCommentDialog(true)}
                className={classNames(
                  'flex items-center gap-2',
                  'border border-gray-200 dark:border-gray-700',
                  'text-gray-700 dark:text-gray-300',
                  'hover:bg-gray-50 dark:hover:bg-gray-700',
                  'rounded-lg px-4 py-2',
                  'shadow-xs'
                )}
              >
                <ChatBubbleLeftRightIcon className='h-4 w-4' />
                Add Comment
              </Button>
            </div>
          </div>
        </div>
      )}

      <RerunDialog
        isOpenRerunWorkflowDialog={isOpenRerunWorkflowDialog}
        workflowRunName={workflowRunDetail?.workflowRunName || ''}
        workflowName={workflowRunDetail?.workflow.name || ''}
        workflowRunRerunValidMapData={workflowRunRerunValidMapData || null}
        selectedDataset={selectedDataset || ''}
        setSelectedDataset={setSelectedDataset}
        isDeprecated={isDeprecated}
        setIsDeprecated={setIsDeprecated}
        handleCloseRerunWorkflowDialog={handleCloseRerunWorkflowDialog}
        handleRerunWorkflow={handleRerunWorkflow}
        isFetchingWorkflowRunRerunValidMap={isFetchingWorkflowRunRerunValidMap}
      />
      {/* comment dialog */}
      <CommentDialog
        isOpenAddCommentDialog={isOpenAddCommentDialog}
        isOpenUpdateCommentDialog={false}
        isOpenDeleteCommentDialog={false}
        comment={comment}
        setComment={setComment}
        handleClose={() => {
          setIsOpenAddCommentDialog(false);
          setComment('');
        }}
        handleAddComment={handleAddComment}
        handleUpdateComment={() => {}}
        handleDeleteComment={() => {}}
        user={user}
      />
      {/* state dialog */}
      <StateDialog
        isOpenAddStateDialog={isOpenAddStateDialog}
        isOpenUpdateStateDialog={false}
        user={user}
        validStatesToCreate={validState}
        selectedState={stateStatus}
        setSelectedState={setStateStatus}
        handleClose={() => {
          setIsOpenAddStateDialog(false);
        }}
        stateComment={stateComment}
        setStateComment={setStateComment}
        handleStateCreationEvent={handleStateCreationEvent}
        handleUpdateState={() => {}}
      />
    </div>
  );
};

export default WorkflowRunsDetailsHeader;
