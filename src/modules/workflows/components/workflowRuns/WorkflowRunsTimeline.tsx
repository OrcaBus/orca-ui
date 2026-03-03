import { useState, useEffect, useMemo, startTransition } from 'react';
import { useParams } from 'react-router-dom';
import { Timeline, TimelineEventTypes } from '@/components/common/timelines';
import type { TimelineEvent } from '@/components/common/timelines';
import { ContentTabs } from '@/components/navigation/tabs';
import { JsonToNestedList, JsonDisplay } from '@/components/common/json-to-table';
import {
  useWorkflowPayloadModel,
  useWorkflowRunCommentUpdateModel,
  useWorkflowRunCommentDeleteModel,
  useWorkflowRunStateUpdateModel,
} from '@/api/workflow';
import { keepPreviousData } from '@tanstack/react-query';
import {
  TrashIcon,
  EyeSlashIcon,
  EyeIcon,
  BarsArrowUpIcon,
  BarsArrowDownIcon,
  PencilIcon,
} from '@heroicons/react/24/outline';
import toaster from '@/components/common/toaster';
import { useAuthContext } from '@/context/AmplifyAuthContext';
import { Badge } from '@/components/common/badges';
import { getBadgeStatusType, statusBackgroundColor } from '@/utils/statusUtils';
import { dayjs } from '@/utils/dayjs';
import { classNames, getUsername } from '@/utils/commonUtils';
import { BackdropWithText } from '@/components/common/backdrop';
import { useWorkflowRunsContext } from './WorkflowRunsContext';
import { Button } from '@/components/common/buttons';
import CommentDialog from '../common/CommentDialog';
import StateDialog from '../common/StateDialog';
import { Accordion } from '@/components/common/accordion';
import { useUserPreferencesLocalStorage } from '@/hooks/useLocalStorage';

interface PayloadContentProps {
  selectedState: string;
  currentState: string;
  selectedWorkflowPayloadData: unknown;
  isFetching: boolean;
}

const PayloadContent = ({
  selectedState,
  currentState,
  selectedWorkflowPayloadData,
  isFetching,
}: PayloadContentProps) => (
  <div className='flex flex-col space-y-4 px-2'>
    {/* State Badge Card */}
    <div
      className={classNames(
        'flex items-center gap-3 rounded-lg p-3',
        'bg-linear-to-r from-gray-50/80 to-white dark:from-gray-800/80 dark:to-gray-800/50'
      )}
    >
      <span className='text-sm font-medium text-gray-600 dark:text-gray-400'>
        {selectedState ? 'Selected State' : 'Current State'}:
      </span>
      <Badge status={selectedState || currentState || 'unknown'} className='shadow-xs'>
        {selectedState || currentState || 'unknown'}
      </Badge>
    </div>

    {/* Content Section */}
    <div className='flex flex-col space-y-1 rounded-lg'>
      <ContentTabs
        className='rounded-lg bg-white bg-linear-to-r from-gray-50/80 to-white shadow-xs dark:bg-gray-900 dark:from-gray-800/80 dark:to-gray-800/50'
        tabs={[
          {
            label: 'Payload Data',
            content: (
              <div className='flex flex-col gap-3 p-2'>
                {selectedWorkflowPayloadData ? (
                  Object.entries(
                    (selectedWorkflowPayloadData as { data?: Record<string, unknown> })
                      ?.data as Record<string, unknown>
                  ).map(([key, value]) => (
                    <Accordion
                      key={key}
                      title={key}
                      defaultOpen={true}
                      chevronPosition='right'
                      className={classNames(
                        'rounded-lg',
                        'bg-linear-to-r from-white via-gray-50/80 to-gray-100/50',
                        'dark:from-gray-900 dark:via-gray-800/80 dark:to-gray-800/50',
                        'shadow-xs hover:shadow-md',
                        'ring-1 ring-gray-200/50 dark:ring-gray-700/50',
                        'transition-all duration-200 ease-in-out',
                        'group'
                      )}
                      buttonClassName={classNames(
                        'border-0',
                        'bg-linear-to-r from-blue-50/90 to-transparent',
                        'dark:from-blue-900/30 dark:to-transparent',
                        'group-hover:from-blue-100/80 dark:group-hover:from-blue-800/40',
                        'transition-all duration-300'
                      )}
                    >
                      <div className='divide-y divide-gray-100 bg-white/50 dark:divide-gray-800 dark:bg-gray-900/50'>
                        {typeof value === 'string' ? (
                          <div className='max-w-lg overflow-auto p-2 text-sm break-words whitespace-pre-wrap text-gray-700 dark:text-gray-300'>
                            {value}
                          </div>
                        ) : (
                          <JsonToNestedList
                            data={value as Record<string, unknown>}
                            isURIIncluded={true}
                            isFetchingData={isFetching}
                            inCard={false}
                            className='space-y-0'
                            listClassName='hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors duration-200'
                          />
                        )}
                      </div>
                    </Accordion>
                  ))
                ) : (
                  <div className='flex flex-col gap-3 p-2'>
                    <div className='flex flex-col gap-1'>
                      <span className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                        No payload data found
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ),
          },
          {
            label: 'JSON View',
            content: (
              <div
                className={classNames(
                  'rounded-lg p-4',
                  'bg-gray-50/50 dark:bg-gray-800/50',
                  'font-mono text-sm'
                )}
              >
                {selectedWorkflowPayloadData ? (
                  <JsonDisplay
                    data={selectedWorkflowPayloadData as Record<string, unknown>}
                    isFetchingData={isFetching}
                  />
                ) : (
                  <div className='flex flex-col gap-3 p-2'>
                    <div className='flex flex-col gap-1'>
                      <span className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                        No payload data found
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ),
          },
        ]}
      />
    </div>
  </div>
);

const WorkflowRunsTimeline = () => {
  const { orcabusId } = useParams();
  const { user } = useAuthContext();
  const {
    workflowStateData,
    refetchWorkflowState,
    isFetchingWorkflowState,
    workflowCommentData,
    refetchWorkflowComment,
    isFetchingWorkflowComment,
    workflowRunStateCreationValidMapData,
    isFetchingWorkflowRunStateCreationValidMap,
  } = useWorkflowRunsContext();
  const [currentState, setCurrentState] = useState<string | null>(null);
  const [selectedPayloadId, setSelectedPayloadId] = useState<string | null>(null);
  const [selectedState, setSelectedState] = useState<string | null>(null);

  const [isOpenUpdateCommentDialog, setIsOpenUpdateCommentDialog] = useState<boolean>(false);
  const [isOpenDeleteCommentDialog, setIsOpenDeleteCommentDialog] = useState<boolean>(false);
  const [commentId, setCommentId] = useState<string | null>(null);
  const [comment, setComment] = useState<string>('');

  const [isReverseOrder, setIsReverseOrder] = useUserPreferencesLocalStorage(
    'workflow-run-timeline-reverse-order',
    false
  );

  const [isOpenUpdateStateDialog, setIsOpenUpdateStateDialog] = useState<boolean>(false);
  const [stateId, setStateId] = useState<string | null>(null);
  const [stateComment, setStateComment] = useState<string>('');

  const [showPayload, setShowPayload] = useState(false);

  const workflowLastState = workflowStateData?.sort((a, b) =>
    dayjs(a.timestamp).isAfter(dayjs(b.timestamp)) ? -1 : 1
  )[0];

  const workflowStateTimelineData = useMemo(
    () =>
      workflowStateData
        ? workflowStateData.map((state) => ({
            id: state.orcabusId as string,
            title: 'Workflow State Update',
            actionsList: Object.keys(workflowRunStateCreationValidMapData || {}).includes(
              state.status
            )
              ? [
                  {
                    label: 'Edit',
                    icon: PencilIcon,
                    onClick: () => {
                      setStateId(state.orcabusId as string);
                      setStateComment(state.comment || '');
                      setIsOpenUpdateStateDialog(true);
                    },
                  },
                ]
              : [],
            datetime: state.timestamp,
            comment: state.comment || '',
            status: state.status,
            iconBackground: statusBackgroundColor(getBadgeStatusType(state.status)),
            payloadId: state?.payload || '',
            eventType: TimelineEventTypes.STATE_CHANGE,
          }))
        : [],
    [workflowStateData, workflowRunStateCreationValidMapData]
  );

  const workflowCommentTimelineData = useMemo(
    () =>
      workflowCommentData
        ? workflowCommentData.map((comment) => ({
            id: comment.orcabusId as string,
            title: 'Comment Added',
            datetime: comment.updatedAt,
            iconBackground: 'bg-blue-100 dark:bg-blue-900',
            comment: comment.text,
            actionsList: [
              {
                label: 'Edit',
                icon: PencilIcon,
                onClick: () => {
                  setCommentId(comment.orcabusId as string);
                  setComment(comment.text || '');
                  setIsOpenUpdateCommentDialog(true);
                },
              },
              {
                label: 'Delete',
                icon: TrashIcon,
                onClick: () => {
                  setCommentId(comment.orcabusId as string);
                  setIsOpenDeleteCommentDialog(true);
                },
              },
            ],
            eventType: TimelineEventTypes.COMMENT,
            user: {
              name: getUsername(comment.createdBy || ''),
              // Optional: Add avatar if available
              // avatar: getUserAvatar(comment.createdBy)
            },
          }))
        : [],
    [workflowCommentData]
  );

  const workflowRunTimelineData = [
    ...workflowStateTimelineData,
    ...workflowCommentTimelineData,
  ].sort((a, b) => (dayjs(a.datetime).isAfter(dayjs(b.datetime)) ? -1 : 1));

  useEffect(() => {
    if (workflowLastState) {
      startTransition(() => {
        setCurrentState(workflowLastState?.status || '');
        setSelectedPayloadId(workflowLastState?.payload || '');
      });
    }
  }, [workflowLastState]);

  const { data: selectedWorkflowPayloadData, isFetching } = useWorkflowPayloadModel({
    params: { path: { orcabusId: selectedPayloadId as string } },
    reactQuery: {
      enabled: !!selectedPayloadId,
      placeholderData: keepPreviousData,
    },
  });

  const handleTimelineSelect = (event: TimelineEvent) => {
    if (event.eventType !== 'stateChange') {
      setSelectedPayloadId(null);
      setSelectedState(null);
      return;
    }

    // Update state and show payload for new selection
    setSelectedPayloadId(event.payloadId || null);
    setSelectedState(event.status || null);
    // setShowPayload(true);
  };

  const {
    mutate: updateWorkflowRunComment,
    isSuccess: isUpdatedWorkflowRunComment,
    isError: isErrorUpdatingWorkflowRunComment,
    reset: resetUpdateWorkflowRunComment,
  } = useWorkflowRunCommentUpdateModel({
    params: {
      path: {
        orcabusId: orcabusId as string,
        commentOrcabusId: commentId as string,
      },
    },
    body: {
      comment: comment,
      createdBy: user?.email,
    },
    reactQuery: {
      enabled: !!commentId,
    },
  });

  const handleUpdateComment = () => {
    updateWorkflowRunComment();
    setIsOpenUpdateCommentDialog(false);
  };

  useEffect(() => {
    if (isUpdatedWorkflowRunComment) {
      toaster.success({ title: 'Comment updated successfully' });
      refetchWorkflowComment();
      resetUpdateWorkflowRunComment();
      startTransition(() => {
        setComment('');
      });
    }

    if (isErrorUpdatingWorkflowRunComment) {
      toaster.error({ title: 'Error updating comment' });
      resetUpdateWorkflowRunComment();
    }
  }, [
    isUpdatedWorkflowRunComment,
    refetchWorkflowComment,
    resetUpdateWorkflowRunComment,
    isErrorUpdatingWorkflowRunComment,
  ]);

  const {
    mutate: deleteWorkflowRunComment,
    isSuccess: isDeletedWorkflowRunComment,
    isError: isErrorDeletingWorkflowRunComment,
    reset: resetDeleteWorkflowRunComment,
  } = useWorkflowRunCommentDeleteModel({
    params: {
      path: {
        orcabusId: orcabusId as string,
        commentOrcabusId: commentId as string,
      },
    },
    body: {
      createdBy: user?.email,
    },
  });

  const handleDeleteComment = () => {
    deleteWorkflowRunComment();
    setIsOpenDeleteCommentDialog(false);
  };

  useEffect(() => {
    if (isDeletedWorkflowRunComment) {
      toaster.success({ title: 'Comment deleted successfully' });
      refetchWorkflowComment();
      resetDeleteWorkflowRunComment();
      startTransition(() => {
        setComment('');
      });
    }

    if (isErrorDeletingWorkflowRunComment) {
      toaster.error({ title: 'Error deleting comment' });
      resetDeleteWorkflowRunComment();
    }
  }, [
    isDeletedWorkflowRunComment,
    refetchWorkflowComment,
    resetDeleteWorkflowRunComment,
    isErrorDeletingWorkflowRunComment,
  ]);

  const {
    mutate: updateWorkflowRunState,
    isSuccess: isUpdatedWorkflowRunState,
    isError: isErrorUpdatingWorkflowRunState,
    reset: resetUpdateWorkflowRunState,
  } = useWorkflowRunStateUpdateModel({
    params: {
      path: {
        orcabusId: orcabusId as string,
        id: stateId as string,
      },
    },
    body: {
      comment: stateComment,
    },
  });

  const handleUpdateState = () => {
    updateWorkflowRunState();
    setIsOpenUpdateStateDialog(false);
  };

  useEffect(() => {
    if (isUpdatedWorkflowRunState) {
      toaster.success({ title: 'State updated successfully' });
      refetchWorkflowState();
      resetUpdateWorkflowRunState();
      startTransition(() => {
        setStateComment('');
      });
    }

    if (isErrorUpdatingWorkflowRunState) {
      toaster.error({ title: 'Error updating state' });
      resetUpdateWorkflowRunState();
    }
  }, [
    isUpdatedWorkflowRunState,
    refetchWorkflowState,
    resetUpdateWorkflowRunState,
    isErrorUpdatingWorkflowRunState,
  ]);

  return (
    <div>
      {(isFetchingWorkflowState ||
        isFetchingWorkflowComment ||
        isFetchingWorkflowRunStateCreationValidMap) && (
        <BackdropWithText text='Loading Workflow Run Timeline data...' />
      )}
      <div className='flex flex-col gap-1 pb-4'>
        {/* timeline header part */}
        <div className='mb-4 flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <h2 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>Timeline</h2>
            <span className='text-sm text-gray-500 dark:text-gray-400'>
              {workflowRunTimelineData.length} events
            </span>
          </div>
          <div className='flex items-center gap-2'>
            <Button
              type='gray'
              size='xs'
              rounded
              onClick={() => setShowPayload(!showPayload)}
              className={classNames(
                'flex items-center gap-2',
                'border border-gray-200 dark:border-gray-700',
                'text-gray-700 dark:text-gray-300',
                'hover:bg-gray-50 dark:hover:bg-gray-700',
                'rounded-lg px-4 py-2',
                'shadow-xs'
              )}
            >
              {showPayload ? <EyeSlashIcon className='h-4 w-4' /> : <EyeIcon className='h-4 w-4' />}
              {showPayload ? 'Hide Payload' : 'Show Payload'}
            </Button>
            <Button
              type='gray'
              size='xs'
              onClick={() => setIsReverseOrder(!isReverseOrder)}
              className={classNames(
                'flex items-center gap-2',
                'border border-gray-200 dark:border-gray-700',
                'text-gray-700 dark:text-gray-300',
                'hover:bg-gray-50 dark:hover:bg-gray-700',
                'rounded-lg px-4 py-2',
                'shadow-xs'
              )}
            >
              {isReverseOrder ? (
                <BarsArrowUpIcon className='h-4 w-4' />
              ) : (
                <BarsArrowDownIcon className='h-4 w-4' />
              )}
              <span>{isReverseOrder ? 'Oldest First' : 'Latest First'}</span>
            </Button>
          </div>
        </div>
        {/* timeline content part */}
        <div className='flex h-full flex-row gap-2'>
          <div className='flex-1'>
            <div className='shrink-0'>
              <Timeline
                timelineEvents={
                  isReverseOrder ? workflowRunTimelineData.reverse() : workflowRunTimelineData
                }
                handldEventClick={handleTimelineSelect}
                isCollapsed={showPayload}
              />
            </div>
          </div>
          {showPayload && (
            <div className='flex-2'>
              <PayloadContent
                selectedState={selectedState || ''}
                currentState={currentState || ''}
                selectedWorkflowPayloadData={selectedPayloadId ? selectedWorkflowPayloadData : null}
                isFetching={isFetching}
              />
            </div>
          )}
        </div>

        <div>
          {/* comment dialog */}
          <CommentDialog
            isOpenAddCommentDialog={false}
            isOpenUpdateCommentDialog={isOpenUpdateCommentDialog}
            isOpenDeleteCommentDialog={isOpenDeleteCommentDialog}
            comment={comment}
            setComment={setComment}
            handleClose={() => {
              setIsOpenUpdateCommentDialog(false);
              setIsOpenDeleteCommentDialog(false);
              setComment('');
            }}
            handleAddComment={() => {}}
            handleUpdateComment={handleUpdateComment}
            handleDeleteComment={handleDeleteComment}
            user={user}
          />
          {/* state dialog */}
          <StateDialog
            isOpenAddStateDialog={false}
            isOpenUpdateStateDialog={isOpenUpdateStateDialog}
            user={user}
            currentState={currentState}
            handleClose={() => {
              setIsOpenUpdateStateDialog(false);
            }}
            stateComment={stateComment}
            setStateComment={setStateComment}
            handleStateCreationEvent={() => {}}
            handleUpdateState={handleUpdateState}
          />
        </div>
      </div>
    </div>
  );
};

export default WorkflowRunsTimeline;
