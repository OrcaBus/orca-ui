import { startTransition, useEffect, useMemo, useState } from 'react';
import { useSequenceRunContext } from './SequenceRunContext';
import { useSequenceRunDetailsContext } from './SequenceRunDetailsContext';
import { useAuthContext } from '@/context/AmplifyAuthContext';
import { classNames } from '@/utils/commonUtils';
import { Button } from '@/components/common/buttons';
import { ChatBubbleLeftRightIcon, PlusIcon } from '@heroicons/react/24/outline';
import CommentDialog from '../common/CommentDialog';
import StateDialog from '../common/StateDialog';
import {
  useSequenceRunCommentCreateModel,
  useSequenceRunStateCreateModel,
} from '@/api/sequenceRun';
import toaster from '@/components/common/toaster';
import { dayjs } from '@/utils/dayjs';

const SequenceRunDetailsActions = () => {
  const { user } = useAuthContext();

  const { sequenceRunDetail, refetchSequenceRunComment } = useSequenceRunContext();

  const { sequenceRunStateValidMapData, refetchSequenceRunState } = useSequenceRunDetailsContext();

  const orcabusIds =
    sequenceRunDetail
      ?.sort((a, b) => (dayjs(a.startTime).isAfter(dayjs(b.startTime)) ? -1 : 1))
      .map((sequenceRun) => sequenceRun.orcabusId) ?? [];

  // real sequence run orcabus id with status
  const latestRealSequenceRunOrcabusId =
    sequenceRunDetail
      ?.sort((a, b) => (dayjs(a.startTime).isAfter(dayjs(b.startTime)) ? -1 : 1))
      ?.filter((sequenceRun) => sequenceRun.status !== null)
      ?.map((sequenceRun) => sequenceRun.orcabusId)[0] ?? null;

  const [selectedSequenceRunOrcabusId, setSelectedSequenceRunOrcabusId] = useState<string>(
    (latestRealSequenceRunOrcabusId as string) ?? orcabusIds[0]
  );

  const sequenceRunDetailDropdownItems = useMemo(() => {
    return sequenceRunDetail
      ? sequenceRunDetail
          .sort((a, b) => (dayjs(a.startTime).isAfter(dayjs(b.startTime)) ? -1 : 1))
          .map((sequenceRun) => ({
            label: sequenceRun.sequenceRunId,
            onClick: () => setSelectedSequenceRunOrcabusId(sequenceRun.orcabusId),
          }))
      : [];
  }, [sequenceRunDetail, setSelectedSequenceRunOrcabusId]);

  // sequence run state dropdown items (sequence run with status)
  const sequenceRunStateDropdownItems = useMemo(() => {
    return sequenceRunDetail
      ?.sort((a, b) => (dayjs(a.startTime).isAfter(dayjs(b.startTime)) ? -1 : 1))
      ?.filter((sequenceRun) => sequenceRun.status !== null)
      ?.map((sequenceRun) => ({
        label: sequenceRun.sequenceRunId,
        onClick: () => setSelectedSequenceRunOrcabusId(sequenceRun.orcabusId),
      }));
  }, [sequenceRunDetail, setSelectedSequenceRunOrcabusId]);

  // comment dialog
  const [isOpenAddCommentDialog, setIsOpenAddCommentDialog] = useState(false);
  const [comment, setComment] = useState('');

  const {
    mutate: createSequenceRunComment,
    isSuccess: isCreatedSequenceRunComment,
    isError: isErrorCreatingSequenceRunComment,
    reset: resetCreateSequenceRunComment,
  } = useSequenceRunCommentCreateModel({
    params: { path: { orcabusId: selectedSequenceRunOrcabusId as string } },
    body: {
      comment: comment,
      createdBy: user?.email,
    },
  });

  const handleAddComment = () => {
    createSequenceRunComment();
    setIsOpenAddCommentDialog(false);
  };

  useEffect(() => {
    if (isCreatedSequenceRunComment) {
      toaster.success({ title: 'Comment added successfully' });
      refetchSequenceRunComment();
      resetCreateSequenceRunComment();
      startTransition(() => {
        setComment('');
      });
    }

    if (isErrorCreatingSequenceRunComment) {
      toaster.error({ title: 'Error adding comment' });
      resetCreateSequenceRunComment();
    }
  }, [
    isCreatedSequenceRunComment,
    isErrorCreatingSequenceRunComment,
    refetchSequenceRunComment,
    resetCreateSequenceRunComment,
  ]);

  // state dialog
  const [isOpenAddStateDialog, setIsOpenAddStateDialog] = useState<boolean>(false);
  const [stateStatus, setStateStatus] = useState<string | null>(null);
  const [stateComment, setStateComment] = useState<string>('');

  const {
    mutate: createSequenceRunState,
    isSuccess: isCreatedSequenceRunState,
    isError: isErrorCreatingSequenceRunState,
    reset: resetCreateSequenceRunState,
  } = useSequenceRunStateCreateModel({
    params: { path: { orcabusId: selectedSequenceRunOrcabusId as string } },
    body: {
      status: stateStatus,
      comment: stateComment,
      createdBy: user?.email,
    },
  });

  const handleStateCreationEvent = () => {
    createSequenceRunState();
    setIsOpenAddStateDialog(false);
  };

  useEffect(() => {
    if (isCreatedSequenceRunState) {
      toaster.success({ title: 'State added successfully' });
      refetchSequenceRunState();
      resetCreateSequenceRunState();
      startTransition(() => {
        setStateStatus(null);
        setStateComment('');
      });
    }

    if (isErrorCreatingSequenceRunState) {
      toaster.error({ title: 'Error adding state' });
      resetCreateSequenceRunState();
    }
  }, [
    isCreatedSequenceRunState,
    refetchSequenceRunState,
    resetCreateSequenceRunState,
    isErrorCreatingSequenceRunState,
  ]);

  const selectedSequenceRun = useMemo(() => {
    return sequenceRunDetail?.find(
      (sequenceRun) => sequenceRun.orcabusId === selectedSequenceRunOrcabusId
    );
  }, [sequenceRunDetail, selectedSequenceRunOrcabusId]);

  const validStateOptions = useMemo(() => {
    return Object.entries(sequenceRunStateValidMapData || {})
      .filter(([, value]) => (value as string[]).includes(selectedSequenceRun?.status as string))
      .map(([key]) => key);
  }, [sequenceRunStateValidMapData, selectedSequenceRun]);

  return (
    <div className={classNames('flex w-full flex-col gap-3', 'bg-white dark:bg-gray-900')}>
      <div className='flex flex-col gap-2 py-2'>
        <div className='flex flex-wrap items-center gap-2'>
          <Button
            type='gray'
            size='xs'
            rounded
            onClick={() => setIsOpenAddStateDialog(true)}
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
          setSelectedSequenceRunOrcabusId(orcabusIds[0]);
        }}
        handleAddComment={handleAddComment}
        handleUpdateComment={() => {}}
        handleDeleteComment={() => {}}
        user={user}
        selectedRunId={selectedSequenceRun?.sequenceRunId}
        runDetailDropdownItems={sequenceRunDetailDropdownItems}
      />

      {/* state dialog */}
      <StateDialog
        isOpenAddStateDialog={isOpenAddStateDialog}
        isOpenUpdateStateDialog={false}
        user={user}
        validStatesToCreate={validStateOptions}
        selectedState={stateStatus}
        setSelectedState={setStateStatus}
        handleClose={() => {
          setIsOpenAddStateDialog(false);
          setSelectedSequenceRunOrcabusId(latestRealSequenceRunOrcabusId as string);
        }}
        stateComment={stateComment}
        setStateComment={setStateComment}
        handleStateCreationEvent={handleStateCreationEvent}
        handleUpdateState={() => {}}
        selectedRunId={selectedSequenceRun?.sequenceRunId}
        runDetailDropdownItems={sequenceRunStateDropdownItems}
      />
    </div>
  );
};

export default SequenceRunDetailsActions;
