import { FC, ReactNode, MouseEventHandler } from 'react';
import { classNames } from '@/utils/commonUtils';
import { Tooltip } from '@/components/common/tooltips';

export interface ButtonProps {
  type?: 'primary' | 'secondary' | 'light' | 'green' | 'red' | 'yellow' | 'gray';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  rounded?: boolean;
  children: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  tooltip?: string;
  tooltipPosition?: 'top' | 'bottom' | 'left' | 'right';
  tooltipBackground?: 'light' | 'dark';
}

const Button: FC<ButtonProps> = ({
  type = 'primary',
  size = 'md',
  children,
  rounded = false,
  onClick,
  className = '',
  disabled = false,
  loading = false,
  tooltip,
  tooltipPosition = 'top',
  tooltipBackground = 'dark',
}) => {
  const baseStyles =
    'relative inline-flex gap-2 items-center justify-center font-medium tracking-wide transition-all duration-200 ease-in-out focus:outline-hidden focus:ring-1 focus:ring-offset-2 active:transform active:scale-90 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none';

  const typeStyles: { [key: string]: string } = {
    primary:
      'text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600' +
      ' shadow-md hover:shadow-lg',
    secondary:
      'text-blue-700 bg-blue-100 hover:bg-blue-200 focus:ring-blue-500 dark:bg-blue-200 dark:hover:bg-blue-300' +
      ' dark:text-blue-800',
    light:
      'text-gray-700 bg-white hover:bg-gray-50 focus:ring-gray-500 dark:bg-gray-800 dark:text-gray-100' +
      ' dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600',
    green:
      'text-white bg-green-600 hover:bg-green-700 focus:ring-green-500 dark:bg-green-500 dark:hover:bg-green-600' +
      ' shadow-md hover:shadow-lg',
    red:
      'text-white bg-red-600 hover:bg-red-700 focus:ring-red-500 dark:bg-red-500 dark:hover:bg-red-600' +
      ' shadow-md hover:shadow-lg',
    yellow:
      'text-white bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-500 dark:bg-yellow-400 dark:hover:bg-yellow-500' +
      ' shadow-md hover:shadow-lg',
    gray:
      'text-gray-700 bg-gray-100 hover:bg-gray-200 focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-100' +
      ' dark:hover:bg-gray-600',
  };

  const sizeStyles: { [key: string]: string } = {
    xs: 'text-xs px-2.5 py-1.5',
    sm: 'text-sm px-3 py-2',
    md: 'text-base px-4 py-2',
    lg: 'text-lg px-6 py-3',
  };

  const button = (
    <button
      type='button'
      className={classNames(
        baseStyles,
        typeStyles[type],
        sizeStyles[size],
        rounded ? 'rounded-full' : 'rounded-sm',
        disabled ? 'cursor-not-allowed opacity-50' : ' ',
        loading ? 'cursor-wait' : ' ',
        className
      )}
      onClick={onClick}
      disabled={disabled}
    >
      {loading ? (
        <span className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'>
          <svg className='h-5 w-5 animate-spin' viewBox='0 0 24 24'>
            <circle
              className='opacity-25'
              cx='12'
              cy='12'
              r='10'
              stroke='currentColor'
              strokeWidth='4'
              fill='none'
            />
            <path
              className='opacity-75'
              fill='currentColor'
              d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z'
            />
          </svg>
        </span>
      ) : (
        children
      )}
    </button>
  );

  if (tooltip) {
    return (
      <Tooltip text={tooltip} position={tooltipPosition} background={tooltipBackground}>
        {button}
      </Tooltip>
    );
  }

  return button;
};

export default Button;
