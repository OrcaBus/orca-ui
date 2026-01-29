import { classNames } from '@/utils/commonUtils';

export const inputClassName = classNames(
  'mt-2 block w-full rounded-lg px-3 py-2 text-sm',
  'bg-white dark:bg-gray-800',
  'border border-gray-300 dark:border-gray-600',
  'text-gray-900 dark:text-white',
  'placeholder:text-gray-400 dark:placeholder:text-gray-500',
  'focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
  'dark:focus:border-blue-400 dark:focus:ring-blue-400/20',
  'transition-all duration-200',
  'hover:border-gray-400 dark:hover:border-gray-500'
);

export const labelClassName = 'block text-sm font-medium text-gray-900 dark:text-white mb-1';
