import { useState, useEffect, useMemo, startTransition } from 'react';
import { useParams } from 'react-router-dom';
import { Timeline, TimelineEventTypes } from '@/components/common/timelines';
import {
  useAnalysisRunCommentCreateModel,
  useAnalysisRunCommentUpdateModel,
  useAnalysisRunCommentDeleteModel,
} from '@/api/workflow';
import {
  TrashIcon,
  PencilIcon,
  BarsArrowUpIcon,
  BarsArrowDownIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';
import toaster from '@/components/common/toaster';
import { useAuthContext } from '@/context/AmplifyAuthContext';
import { dayjs } from '@/utils/dayjs';
import { classNames, getUsername } from '@/utils/commonUtils';
import { BackdropWithText } from '@/components/common/backdrop';
import { useAnalysisRunsContext } from './AnalysisRunsContext';
import { Button } from '@/components/common/buttons';
import CommentDialog from '../common/CommentDialog';
import { statusBackgroundColor } from '@/utils/statusUtils';
import { getBadgeStatusType } from '@/utils/statusUtils';
import { useUserPreferencesLocalStorage } from '@/hooks/useLocalStorage';

const AnalysisRunsTimeline = () => {
  const { orcabusId } = useParams();
  const { user } = useAuthContext();
  const {
    analysisRunDetail,
    analysisRunCommentData,
    refetchAnalysisRunComment,
    isFetchingAnalysisRunComment,
  } = useAnalysisRunsContext();

  const [isOpenAddCommentDialog, setIsOpenAddCommentDialog] = useState<boolean>(false);
  const [isOpenUpdateCommentDialog, setIsOpenUpdateCommentDialog] = useState<boolean>(false);
  const [isOpenDeleteCommentDialog, setIsOpenDeleteCommentDialog] = useState<boolean>(false);
  const [commentId, setCommentId] = useState<string | null>(null);
  const [comment, setComment] = useState<string>('');

  const [isReverseOrder, setIsReverseOrder] = useUserPreferencesLocalStorage(
    'analysis-run-timeline-reverse-order',
    false
  );

  const analysisRunStateTimelineData = useMemo(
    () =>
      (analysisRunDetail?.states ?? []).map((state) => ({
        id: state.orcabusId as string,
        title: 'Analysis Run State Update',
        datetime: state.timestamp,
        comment: state.comment || '',
        status: state.status,
        iconBackground: statusBackgroundColor(getBadgeStatusType(state.status)),
        eventType: TimelineEventTypes.STATE_CHANGE,
      })),
    [analysisRunDetail]
  );

  const analysisRunCommentTimelineData = useMemo(
    () =>
      (analysisRunCommentData?.filter((c) => !c.isDeleted) ?? []).map((c) => ({
        id: c.orcabusId as string,
        title: 'Comment Added',
        datetime: c.updatedAt,
        iconBackground: 'bg-blue-100 dark:bg-blue-900',
        comment: c.text,
        actionsList: [
          {
            label: 'Edit',
            icon: PencilIcon,
            onClick: () => {
              setCommentId(c.orcabusId as string);
              setComment(c.text || '');
              setIsOpenUpdateCommentDialog(true);
            },
          },
          {
            label: 'Delete',
            icon: TrashIcon,
            onClick: () => {
              setCommentId(c.orcabusId as string);
              setIsOpenDeleteCommentDialog(true);
            },
          },
        ],
        eventType: TimelineEventTypes.COMMENT,
        user: {
          name: getUsername(c.createdBy || ''),
        },
      })),
    [analysisRunCommentData]
  );

  const analysisRunTimelineData = [
    ...analysisRunStateTimelineData,
    ...analysisRunCommentTimelineData,
  ].sort((a, b) => (dayjs(a.datetime).isAfter(dayjs(b.datetime)) ? -1 : 1));

  const {
    mutate: createAnalysisRunComment,
    isSuccess: isCreatedAnalysisRunComment,
    isError: isErrorCreatingAnalysisRunComment,
    reset: resetCreateAnalysisRunComment,
  } = useAnalysisRunCommentCreateModel({
    params: { path: { orcabusId: orcabusId as string } },
    body: {
      text: comment,
      createdBy: user?.email ?? '',
    },
  });

  const handleAddComment = () => {
    createAnalysisRunComment();
    setIsOpenAddCommentDialog(false);
  };

  useEffect(() => {
    if (isCreatedAnalysisRunComment) {
      toaster.success({ title: 'Comment added successfully' });
      refetchAnalysisRunComment();
      resetCreateAnalysisRunComment();
      startTransition(() => setComment(''));
    }

    if (isErrorCreatingAnalysisRunComment) {
      toaster.error({ title: 'Error adding comment' });
      resetCreateAnalysisRunComment();
    }
  }, [
    isCreatedAnalysisRunComment,
    isErrorCreatingAnalysisRunComment,
    refetchAnalysisRunComment,
    resetCreateAnalysisRunComment,
  ]);

  const {
    mutate: updateAnalysisRunComment,
    isSuccess: isUpdatedAnalysisRunComment,
    isError: isErrorUpdatingAnalysisRunComment,
    reset: resetUpdateAnalysisRunComment,
  } = useAnalysisRunCommentUpdateModel({
    params: {
      path: {
        orcabusId: orcabusId as string,
        commentOrcabusId: commentId as string,
      },
    },
    body: {
      text: comment,
      createdBy: user?.email ?? '',
    },
  });

  const handleUpdateComment = () => {
    updateAnalysisRunComment();
    setIsOpenUpdateCommentDialog(false);
  };

  useEffect(() => {
    if (isUpdatedAnalysisRunComment) {
      toaster.success({ title: 'Comment updated successfully' });
      refetchAnalysisRunComment();
      resetUpdateAnalysisRunComment();
      startTransition(() => setComment(''));
    }

    if (isErrorUpdatingAnalysisRunComment) {
      toaster.error({ title: 'Error updating comment' });
      resetUpdateAnalysisRunComment();
    }
  }, [
    isUpdatedAnalysisRunComment,
    refetchAnalysisRunComment,
    resetUpdateAnalysisRunComment,
    isErrorUpdatingAnalysisRunComment,
  ]);

  const {
    mutate: deleteAnalysisRunComment,
    isSuccess: isDeletedAnalysisRunComment,
    isError: isErrorDeletingAnalysisRunComment,
    reset: resetDeleteAnalysisRunComment,
  } = useAnalysisRunCommentDeleteModel({
    params: {
      path: {
        orcabusId: orcabusId as string,
        commentOrcabusId: commentId as string,
      },
    },
    body: {
      text: '',
      createdBy: user?.email ?? '',
    },
  });

  const handleDeleteComment = () => {
    deleteAnalysisRunComment();
    setIsOpenDeleteCommentDialog(false);
  };

  useEffect(() => {
    if (isDeletedAnalysisRunComment) {
      toaster.success({ title: 'Comment deleted successfully' });
      refetchAnalysisRunComment();
      resetDeleteAnalysisRunComment();
      startTransition(() => setComment(''));
    }

    if (isErrorDeletingAnalysisRunComment) {
      toaster.error({ title: 'Error deleting comment' });
      resetDeleteAnalysisRunComment();
    }
  }, [
    isDeletedAnalysisRunComment,
    refetchAnalysisRunComment,
    resetDeleteAnalysisRunComment,
    isErrorDeletingAnalysisRunComment,
  ]);

  return (
    <div className='px-6'>
      {isFetchingAnalysisRunComment && (
        <BackdropWithText text='Loading Analysis Run Timeline data...' />
      )}
      <div className='flex flex-col gap-1 pb-4'>
        <div className='mb-4 flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <h2 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>Timeline</h2>
            <span className='text-sm text-gray-500 dark:text-gray-400'>
              {analysisRunTimelineData.length} events
            </span>
          </div>
          <div className='flex items-center gap-2'>
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
        <div className='flex h-full flex-row gap-2'>
          <div className='flex-1'>
            <div className='shrink-0'>
              <Timeline
                timelineEvents={
                  isReverseOrder ? [...analysisRunTimelineData].reverse() : analysisRunTimelineData
                }
                isCollapsed={false}
              />
            </div>
          </div>
        </div>

        <CommentDialog
          isOpenAddCommentDialog={isOpenAddCommentDialog}
          isOpenUpdateCommentDialog={isOpenUpdateCommentDialog}
          isOpenDeleteCommentDialog={isOpenDeleteCommentDialog}
          comment={comment}
          setComment={setComment}
          handleClose={() => {
            setIsOpenAddCommentDialog(false);
            setIsOpenUpdateCommentDialog(false);
            setIsOpenDeleteCommentDialog(false);
            setComment('');
          }}
          handleAddComment={handleAddComment}
          handleUpdateComment={handleUpdateComment}
          handleDeleteComment={handleDeleteComment}
          user={user}
        />
      </div>
    </div>
  );
};

export default AnalysisRunsTimeline;
