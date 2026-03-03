export const statusTextColor = (type: string) => {
  switch (type) {
    case 'success':
      return 'text-emerald-600 dark:text-emerald-400';
    case 'fail':
      return 'text-red-600 dark:text-red-400';
    case 'warning':
      return 'text-amber-600 dark:text-amber-400';
    case 'abort':
      return 'text-gray-600 dark:text-gray-400';
    case 'unknown':
      return 'text-gray-600 dark:text-gray-400';
    case 'running':
      return 'text-blue-600 dark:text-blue-400';
    case 'deprecated':
      return 'text-gray-600 dark:text-gray-400';
    default:
      return 'text-indigo-600 dark:text-indigo-400';
  }
};

export const statusBackgroundColor = (type: string) => {
  switch (type) {
    case 'success':
      return 'bg-emerald-50 dark:bg-gray-800';
    case 'fail':
      return 'bg-red-50 dark:bg-gray-800';
    case 'warning':
      return 'bg-amber-50 dark:bg-gray-800';
    case 'abort':
      return 'bg-gray-50 dark:bg-gray-800';
    case 'unknown':
      return 'bg-gray-50 dark:bg-gray-800';
    case 'running':
      return 'bg-blue-50 dark:bg-gray-800';
    case 'deprecated':
      return 'bg-gray-50 dark:bg-gray-800';
    default:
      return 'bg-indigo-50 dark:bg-gray-800';
  }
};

export const getStatusStyles = (type: string) => {
  switch (type) {
    case 'success':
      return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-gray-800 ring-1 ring-emerald-500/20 dark:ring-gray-700';
    case 'fail':
      return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-gray-800 ring-1 ring-red-500/20 dark:ring-gray-700';
    case 'warning':
      return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-gray-800 ring-1 ring-amber-500/20 dark:ring-gray-700';
    case 'abort':
      return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 ring-1 ring-gray-500/20 dark:ring-gray-700';
    case 'unknown':
      return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 ring-1 ring-gray-500/20 dark:ring-gray-700';
    case 'running':
      return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-gray-800 ring-1 ring-blue-500/20 dark:ring-gray-700';
    case 'deprecated':
      return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 ring-1 ring-gray-500/20 dark:ring-gray-700';
    default:
      return 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-gray-800 ring-1 ring-indigo-500/20 dark:ring-gray-700';
  }
};

export const getBadgeStatusType = (status: string) => {
  switch (status.toUpperCase()) {
    case 'REQUESTED':
    case 'QUEUED':
      return 'primary';

    case 'INITIALIZING':
    case 'PREPARING_INPUTS':
    case 'IN PROGRESS':
    case 'READY':
    case 'GENERATING_OUTPUTS':
      return 'running';

    case 'ABORTING':
    case 'ABORTED':
      return 'abort';

    case 'UNVALIDATED':
      return 'warning';

    case 'FAILED':
    case 'FAILEDUPLOAD':
    case 'STOPPED':
    case 'TIMEDOUT':
      return 'fail';

    case 'SUCCEEDED':
    case 'RESOLVED':
    case 'COMPLETE':
    case 'ACTIVE':
    case 'COMPLETED':
    case 'VALIDATED':
      return 'success';

    case 'DEPRECATED':
      return 'deprecated';

    default:
      return 'unknown';
  }
};
