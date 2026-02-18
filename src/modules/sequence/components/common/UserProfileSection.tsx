import { FC } from 'react';
import { dayjs } from '@/utils/dayjs';
import { FetchUserAttributesOutput } from '@aws-amplify/auth';

interface UserProfileSectionProps {
  user: FetchUserAttributesOutput;
}

const UserProfileSection: FC<UserProfileSectionProps> = ({ user }) => {
  return (
    <div className='flex items-center gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-700'>
      <div className='flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900'>
        <span className='text-sm font-medium text-blue-600 dark:text-blue-300'>
          {user?.email?.[0].toUpperCase() || '?'}
        </span>
      </div>
      <div className='flex flex-col'>
        <span className='text-sm font-medium text-gray-900 dark:text-gray-100'>
          {user?.email || 'Unknown User'}
        </span>
        <span className='text-xs text-gray-500 dark:text-gray-400'>
          {dayjs().format('MMM D, YYYY • h:mm A')}
        </span>
      </div>
    </div>
  );
};

export default UserProfileSection;
