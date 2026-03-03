import { FC } from 'react';
import { Dialog } from '@/components/common/dialogs';
import { ChatBubbleBottomCenterTextIcon } from '@heroicons/react/24/outline';
import { Textarea } from '@headlessui/react';
import UserProfileSection from './UserProfileSection';
import { FetchUserAttributesOutput } from '@aws-amplify/auth';
import { Dropdown } from '@/components/common/dropdowns';
interface CommentDialogProps {
  isOpenAddCommentDialog: boolean;
  isOpenUpdateCommentDialog: boolean;
  isOpenDeleteCommentDialog: boolean;
  comment: string;
  setComment: (comment: string) => void;
  handleClose: () => void;
  handleAddComment: () => void;
  handleUpdateComment: () => void;
  handleDeleteComment: () => void;
  user: FetchUserAttributesOutput;
  selectedRunId?: string;
  runDetailDropdownItems?: { label: string; onClick: () => void }[];
}
const CommentDialog: FC<CommentDialogProps> = ({
  isOpenAddCommentDialog,
  isOpenUpdateCommentDialog,
  isOpenDeleteCommentDialog,
  comment,
  setComment,
  handleClose,
  handleAddComment,
  handleUpdateComment,
  handleDeleteComment,
  user,
  selectedRunId,
  runDetailDropdownItems,
}) => {
  return (
    <Dialog
      TitleIcon={ChatBubbleBottomCenterTextIcon}
      open={isOpenAddCommentDialog || isOpenUpdateCommentDialog || isOpenDeleteCommentDialog}
      title={
        isOpenAddCommentDialog
          ? 'Add a new comment'
          : isOpenUpdateCommentDialog
            ? 'Update a comment'
            : 'Delete a comment'
      }
      content={
        <div className='flex flex-col gap-4 p-2'>
          {/* User Info Section */}
          <UserProfileSection user={user} />

          {/* selected sequence run id */}
          {selectedRunId && runDetailDropdownItems && (
            <div className='flex flex-col items-start gap-2'>
              <div className='flex flex-row gap-2'>
                <Dropdown
                  floatingLabel='Sequence Run ID'
                  value={selectedRunId}
                  items={runDetailDropdownItems ?? []}
                  className='min-w-[250px] dark:bg-gray-800 dark:text-gray-200'
                  menuItemsClassName='min-w-[250px] overflow-y-auto'
                />
              </div>
              <div className='flex flex-row gap-1 px-2 text-red-500'>
                <span className='text-xs'>
                  By default, the comment will be added to the latest sequence run.
                </span>
              </div>
            </div>
          )}

          {/* Comment Input Section */}
          {(isOpenAddCommentDialog || isOpenUpdateCommentDialog) && (
            <div className='flex flex-col gap-2'>
              <label
                htmlFor='comment'
                className='text-sm font-medium text-gray-700 dark:text-gray-300'
              >
                Comment
              </label>
              <Textarea
                id='comment'
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder='Write your comment here...'
                className='min-h-[120px] w-full rounded-lg border border-gray-300 p-3 text-sm text-gray-900 shadow-xs focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100'
              />
            </div>
          )}

          {isOpenDeleteCommentDialog && (
            <div className='flex flex-col gap-2 rounded-lg bg-red-50 p-4 dark:bg-red-600/10'>
              <div className='text-sm font-medium text-red-800 dark:text-red-100'>
                Are you sure you want to delete this comment?
              </div>
              <div className='text-sm text-red-600 dark:text-red-400'>
                This action will be irreversible.
              </div>
            </div>
          )}
        </div>
      }
      onClose={() => {
        handleClose();
        setComment('');
      }}
      closeBtn={{
        label: 'Close',
        onClick: () => {
          handleClose();
          setComment('');
        },
      }}
      confirmBtn={{
        label: isOpenAddCommentDialog
          ? 'Add Comment'
          : isOpenUpdateCommentDialog
            ? 'Update Comment'
            : 'Delete Comment',
        onClick: isOpenAddCommentDialog
          ? handleAddComment
          : isOpenUpdateCommentDialog
            ? handleUpdateComment
            : handleDeleteComment,
      }}
    ></Dialog>
  );
};

export default CommentDialog;
