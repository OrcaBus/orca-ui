import { ReactNode, useState, FC, useEffect, useRef } from 'react';
import { Transition } from '@headlessui/react';
import { classNames } from '@/utils/commonUtils';

interface TooltipProps {
  text: string | ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  size?: 'small' | 'medium' | 'large';
  background?: 'dark' | 'light';
  isShow?: boolean;
  children: ReactNode;
  delay?: number;
  className?: string;
}

const Tooltip: FC<TooltipProps> = ({
  text,
  position = 'top',
  size = 'medium',
  background = 'dark',
  children,
  isShow = true,
  delay = 200,
  className,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isShowTooltips, setIsShowTooltips] = useState(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Add cleanup effect
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    setIsShowTooltips(isShow);
  }, [isShow]);

  const getVariantClasses = () => {
    switch (background) {
      case 'light':
        return 'bg-white text-slate-600 border-slate-200';
      case 'dark':
        return 'bg-slate-700 text-slate-100 border-slate-600';
      default:
        return 'text-slate-600 bg-white dark:bg-slate-700 dark:text-slate-100 border-slate-200 dark:border-slate-600';
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top':
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
      case 'bottom':
        return 'top-full left-1/2 transform -translate-x-1/2 mt-2';
      case 'left':
        return 'right-full top-1/2 transform -translate-y-1/2 mr-2';
      case 'right':
        return 'left-full top-1/2 transform -translate-y-1/2 ml-2';
      default:
        return '';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'text-xs py-1.5 px-2.5 max-w-72';
      case 'large':
        return 'text-sm py-3 px-4 max-w-96';
      default:
        return 'text-sm py-2 px-3 max-w-72';
    }
  };

  const getArrowClasses = () => {
    switch (position) {
      case 'top':
        return 'bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full';
      case 'bottom':
        return 'top-0 left-1/2 transform -translate-x-1/2 -translate-y-full';
      case 'left':
        return 'right-0 top-1/2 transform -translate-y-1/2 translate-x-full';
      case 'right':
        return 'left-0 top-1/2 transform -translate-y-1/2 -translate-x-full';
      default:
        return '';
    }
  };

  return (
    <div
      className='relative inline-flex'
      onMouseEnter={() => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => setIsVisible(true), delay);
      }}
      onMouseLeave={() => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => setIsVisible(false), delay);
      }}
    >
      {children}

      <Transition
        show={isVisible && isShowTooltips}
        enter='transition duration-200 ease-out'
        enterFrom='opacity-0 scale-95'
        enterTo='opacity-100 scale-100'
        leave='transition duration-150 ease-in'
        leaveFrom='opacity-100 scale-100'
        leaveTo='opacity-0 scale-95'
      >
        <div
          className={classNames(
            'absolute z-[999]',
            'rounded-md whitespace-nowrap shadow-lg',
            getPositionClasses(),
            getVariantClasses(),
            getSizeClasses(),
            className
          )}
        >
          {text}
          <div className={getArrowClasses()} />
        </div>
      </Transition>
    </div>
  );
};

export { Tooltip };
