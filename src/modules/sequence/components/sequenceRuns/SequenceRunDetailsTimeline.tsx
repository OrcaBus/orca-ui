import {
  useSequenceRunCommentUpdateModel,
  useSequenceRunCommentDeleteModel,
  useSequenceRunStateUpdateModel,
} from '@/api/sequenceRun';
import { useState, useEffect, useMemo, FC, startTransition } from 'react';
import { dayjs } from '@/utils/dayjs';
import { classNames, getUsername } from '@/utils/commonUtils';
import { Timeline, TimelineEventTypes } from '@/components/common/timelines';
import { getBadgeStatusType, statusBackgroundColor } from '@/utils/statusUtils';
import { BackdropWithText } from '@/components/common/backdrop';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useAuthContext } from '@/context/AmplifyAuthContext';
import toaster from '@/components/common/toaster';
import CommentDialog from '../common/CommentDialog';
import { Button } from '@/components/common/buttons';
import { BarsArrowUpIcon, BarsArrowDownIcon } from '@heroicons/react/24/outline';
import { useUserPreferencesLocalStorage } from '@/hooks/useLocalStorage';
import StateDialog from '../common/StateDialog';
import { useSequenceRunContext } from './SequenceRunContext';
import { useSequenceRunDetailsContext } from './SequenceRunDetailsContext';
import { Dropdown } from '@/components/common/dropdowns';
import { SequenceRunModel } from '@/api/sequenceRun';

interface SequenceRunDetailsTimelineProps {
  selectedSequenceRunId?: string;
}

const SequenceRunDetailsTimeline: FC<SequenceRunDetailsTimelineProps> = ({
  selectedSequenceRunId,
}) => {
  const { user } = useAuthContext();

  const {
    sequenceRunDetail,
    sequenceRunCommentData,
    isFetchingSequenceRunComment,
    refetchSequenceRunComment,
  } = useSequenceRunContext();

  const {
    sequenceRunStateData,
    isFetchingSequenceRunState,
    refetchSequenceRunState,

    sequenceRunStateValidMapData,
    isFetchingSequenceRunStateValidMap,
  } = useSequenceRunDetailsContext();

  // comment dialog
  const [isOpenUpdateCommentDialog, setIsOpenUpdateCommentDialog] = useState<boolean>(false);
  const [isOpenDeleteCommentDialog, setIsOpenDeleteCommentDialog] = useState<boolean>(false);
  const [commentId, setCommentId] = useState<string | null>(null);
  const [comment, setComment] = useState<string>('');

  // state dialog
  const [isOpenUpdateStateDialog, setIsOpenUpdateStateDialog] = useState<boolean>(false);
  const [stateId, setStateId] = useState<string | null>(null);
  const [stateComment, setStateComment] = useState<string>('');

  const [selectedSequenceRunOrcabusId, setSelectedSequenceRunOrcabusId] = useState<string | null>(
    null
  );

  const [selectedMutationSequenceRunOrcabusId, setSelectedMutationSequenceRunOrcabusId] = useState<
    string | null
  >(null);

  const [isReverseOrder, setIsReverseOrder] = useUserPreferencesLocalStorage(
    'sequence-run-timeline-reverse-order',
    false
  );

  const sequenceRunOrcabusId = selectedSequenceRunId || selectedMutationSequenceRunOrcabusId;

  const selectedSequenceRunState = useMemo(() => {
    return selectedSequenceRunOrcabusId
      ? sequenceRunStateData?.filter((state) => state.sequence === selectedSequenceRunOrcabusId)
      : sequenceRunStateData;
  }, [sequenceRunStateData, selectedSequenceRunOrcabusId]);

  const selectedSequenceRunComment = useMemo(() => {
    // check if fake sequence run is selected
    const isFakeSequenceRunSelected = selectedSequenceRunOrcabusId
      ? sequenceRunDetail?.find(
          (sequenceRun: SequenceRunModel) => sequenceRun.orcabusId === selectedSequenceRunOrcabusId
        )?.status == null
        ? true
        : false
      : false;

    if (isFakeSequenceRunSelected) {
      // if fake sequence run is selected, then select sample sheet comment by time sequence of sequence run
      const fakeRunIndex = sequenceRunDetail
        ?.filter((sequenceRun) => sequenceRun.status == null)
        .sort((a, b) => (dayjs(a.startTime).isAfter(dayjs(b.startTime)) ? -1 : 1))
        .findIndex((sequenceRun) => sequenceRun.orcabusId === selectedSequenceRunOrcabusId);
      const sampleSheetComment = sequenceRunCommentData
        ?.filter((comment) => comment.targetType === 'sample_sheet')
        .sort((a, b) => (dayjs(a.createdAt).isAfter(dayjs(b.createdAt)) ? -1 : 1))[
        fakeRunIndex ?? 0
      ];
      const otherComments = selectedSequenceRunOrcabusId
        ? sequenceRunCommentData?.filter(
            (comment) => comment.targetId === selectedSequenceRunOrcabusId?.split('.')[1]
          )
        : sequenceRunCommentData;
      return [
        ...(sampleSheetComment ? [sampleSheetComment] : []),
        ...(otherComments ? otherComments : []),
      ];
    }

    return selectedSequenceRunOrcabusId
      ? sequenceRunCommentData?.filter(
          (comment) => comment.targetId === selectedSequenceRunOrcabusId?.split('.')[1]
        )
      : sequenceRunCommentData;
  }, [sequenceRunCommentData, selectedSequenceRunOrcabusId, sequenceRunDetail]);

  const SequenceRunStateTimelineData = useMemo(() => {
    const failedSateList = ['failed', 'needsattention', 'timedout', 'failedupload', 'stopped'];

    return selectedSequenceRunState
      ? selectedSequenceRunState?.map((state) => ({
          id: state.orcabusId || '',
          title: 'Status Updated',
          actionsList: Object.keys(sequenceRunStateValidMapData || {}).includes(state.status)
            ? [
                {
                  label: 'Edit',
                  icon: PencilIcon,
                  onClick: () => {
                    setStateId(state.orcabusId as string);
                    setStateComment(state.comment || '');
                    setSelectedMutationSequenceRunOrcabusId(state.sequence as string);
                    setIsOpenUpdateStateDialog(true);
                  },
                },
              ]
            : [],
          datetime: state.timestamp,
          comment: state.comment || '',
          status: state.status,
          iconBackground: statusBackgroundColor(getBadgeStatusType(state.status)),
          payloadId: '',
          eventType: failedSateList.includes(state.status.toLowerCase())
            ? TimelineEventTypes.FAILED_ACTION
            : TimelineEventTypes.STATE_CHANGE,
        }))
      : [];
  }, [selectedSequenceRunState, sequenceRunStateValidMapData]);

  const SequenceRunCommentTimelineData = useMemo(() => {
    return selectedSequenceRunComment
      ? selectedSequenceRunComment?.map((comment) => ({
          id: comment.orcabusId || '',
          title:
            comment.targetType === 'sequence'
              ? 'Comment Added to Sequence'
              : comment.targetType === 'sample_sheet'
                ? 'New Sample Sheet Added to Sequence'
                : 'Comment Added',
          datetime: comment.createdAt,
          iconBackground: 'bg-blue-100 dark:bg-blue-900',
          comment: comment.comment,
          actionsList:
            comment.targetType === 'sample_sheet'
              ? [
                  {
                    label: 'Update',
                    onClick: () => {
                      setCommentId(comment.orcabusId as string);
                      setComment(comment.comment);
                      setSelectedMutationSequenceRunOrcabusId(comment.targetId as string);
                      setIsOpenUpdateCommentDialog(true);
                    },
                    icon: PencilIcon,
                  },
                ]
              : [
                  {
                    label: 'Update',
                    onClick: () => {
                      setCommentId(comment.orcabusId as string);
                      setComment(comment.comment);
                      setSelectedMutationSequenceRunOrcabusId(comment.targetId as string);
                      setIsOpenUpdateCommentDialog(true);
                    },
                    icon: PencilIcon,
                  },
                  {
                    label: 'Delete',
                    onClick: () => {
                      setCommentId(comment.orcabusId as string);
                      setSelectedMutationSequenceRunOrcabusId(comment.targetId as string);
                      setIsOpenDeleteCommentDialog(true);
                    },
                    icon: TrashIcon,
                  },
                ],
          eventType:
            comment.targetType === 'sample_sheet'
              ? TimelineEventTypes.SAMPLE_SHEET_UPLOAD
              : TimelineEventTypes.COMMENT,
          user: {
            name: getUsername(comment.createdBy || ''),
            // Optional: Add avatar if available
            // avatar: getUserAvatar(comment.createdBy)
          },
        }))
      : [];
  }, [selectedSequenceRunComment]);

  const timelineData = [...SequenceRunStateTimelineData, ...SequenceRunCommentTimelineData].sort(
    (a, b) => (dayjs(a.datetime).isAfter(dayjs(b.datetime)) ? -1 : 1)
  );

  const {
    mutate: updateSequenceRunComment,
    isSuccess: isUpdatedSequenceRunComment,
    isError: isErrorUpdatingSequenceRunComment,
    reset: resetUpdateSequenceRunComment,
  } = useSequenceRunCommentUpdateModel({
    params: { path: { orcabusId: sequenceRunOrcabusId as string, id: commentId as string } },
    body: {
      comment: comment,
      createdBy: user?.email,
    },
    reactQuery: {
      enabled: !!commentId,
    },
  });

  const handleUpdateComment = () => {
    updateSequenceRunComment();
    setIsOpenUpdateCommentDialog(false);
  };

  useEffect(() => {
    if (isUpdatedSequenceRunComment) {
      toaster.success({ title: 'Comment updated successfully' });
      refetchSequenceRunComment();
      resetUpdateSequenceRunComment();
      startTransition(() => {
        setComment('');
      });
    }

    if (isErrorUpdatingSequenceRunComment) {
      toaster.error({ title: 'Error updating comment' });
      resetUpdateSequenceRunComment();
    }
  }, [
    isUpdatedSequenceRunComment,
    refetchSequenceRunComment,
    resetUpdateSequenceRunComment,
    isErrorUpdatingSequenceRunComment,
  ]);

  const {
    mutate: deleteSequenceRunComment,
    isSuccess: isDeletedSequenceRunComment,
    isError: isErrorDeletingSequenceRunComment,
    reset: resetDeleteSequenceRunComment,
  } = useSequenceRunCommentDeleteModel({
    params: { path: { orcabusId: sequenceRunOrcabusId as string, id: commentId as string } },
    body: {
      createdBy: user?.email,
    },
  });

  const handleDeleteComment = () => {
    deleteSequenceRunComment();
    setIsOpenDeleteCommentDialog(false);
  };

  useEffect(() => {
    if (isDeletedSequenceRunComment) {
      toaster.success({ title: 'Comment deleted successfully' });
      refetchSequenceRunComment();
      resetDeleteSequenceRunComment();
      startTransition(() => {
        setComment('');
      });
    }

    if (isErrorDeletingSequenceRunComment) {
      toaster.error({ title: 'Error deleting comment' });
      resetDeleteSequenceRunComment();
    }
  }, [
    isDeletedSequenceRunComment,
    refetchSequenceRunComment,
    resetDeleteSequenceRunComment,
    isErrorDeletingSequenceRunComment,
  ]);

  const {
    mutate: updateSequenceRunState,
    isSuccess: isUpdatedSequenceRunState,
    isError: isErrorUpdatingSequenceRunState,
    reset: resetUpdateSequenceRunState,
  } = useSequenceRunStateUpdateModel({
    params: { path: { orcabusId: sequenceRunOrcabusId as string, id: stateId as string } },
    body: {
      comment: stateComment,
    },
  });

  const handleUpdateState = () => {
    updateSequenceRunState();
    setIsOpenUpdateStateDialog(false);
  };

  useEffect(() => {
    if (isUpdatedSequenceRunState) {
      toaster.success({ title: 'State updated successfully' });
      refetchSequenceRunState();
      resetUpdateSequenceRunState();
    }

    if (isErrorUpdatingSequenceRunState) {
      toaster.error({ title: 'Error updating state' });
      resetUpdateSequenceRunState();
    }
  }, [
    isUpdatedSequenceRunState,
    refetchSequenceRunState,
    resetUpdateSequenceRunState,
    isErrorUpdatingSequenceRunState,
  ]);

  const sequenceRunDetailDropdownItems = useMemo(() => {
    return sequenceRunDetail
      ?.map((sequenceRun) => ({
        label: sequenceRun.sequenceRunId,
        onClick: () => setSelectedSequenceRunOrcabusId(sequenceRun.orcabusId),
      }))
      .concat({
        label: 'All',
        onClick: () => setSelectedSequenceRunOrcabusId(null),
      })
      .reverse();
  }, [sequenceRunDetail]);

  const isFetching =
    isFetchingSequenceRunState ||
    isFetchingSequenceRunComment ||
    isFetchingSequenceRunStateValidMap;

  return (
    <div className='h-full gap-4 px-4 py-2'>
      {isFetching && <BackdropWithText text='Loading Timeline data...' />}
      <div className='flex h-full flex-col gap-4'>
        {/* timeline header part */}
        <div className='mb-4 flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <h2 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>Timeline</h2>
            <span className='text-sm text-gray-500 dark:text-gray-400'>
              {timelineData.length} events
            </span>
          </div>
          {/* timeeline actions part */}
          <div className='flex items-center gap-2'>
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
            <div className='flex items-center gap-2'>
              <Dropdown
                floatingLabel='Sequence Run ID'
                value={
                  selectedSequenceRunOrcabusId
                    ? sequenceRunDetail?.find(
                        (sequenceRun) => sequenceRun.orcabusId === selectedSequenceRunOrcabusId
                      )?.sequenceRunId || 'All'
                    : 'All'
                }
                items={sequenceRunDetailDropdownItems ?? []}
                className='min-w-[250px] dark:bg-gray-800 dark:text-gray-200'
                menuItemsClassName='min-w-[250px] overflow-y-auto'
              />
            </div>
          </div>
        </div>
        {/* content part */}
        <div className='h-full overflow-visible'>
          <Timeline
            timelineEvents={isReverseOrder ? timelineData.reverse() : timelineData}
            isCollapsed={false}
          />
        </div>
      </div>

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
        currentState={sequenceRunDetail?.[0]?.status as string | null}
        handleClose={() => {
          setIsOpenUpdateStateDialog(false);
        }}
        stateComment={stateComment}
        setStateComment={setStateComment}
        handleStateCreationEvent={() => {}}
        handleUpdateState={handleUpdateState}
      />
    </div>
  );
};

export default SequenceRunDetailsTimeline;
