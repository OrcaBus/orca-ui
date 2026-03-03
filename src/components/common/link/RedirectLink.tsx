import { classNames } from '@/utils/commonUtils';
import { FC } from 'react';
import { Link as RedirectRouterLink } from 'react-router-dom';

interface RedirectLinkProps {
  children: React.ReactNode;
  to: string;
  className?: string;
}

const RedirectLink: FC<RedirectLinkProps> = ({ children, to, className }) => {
  return (
    <RedirectRouterLink
      to={to}
      className={classNames(
        'ml-2 text-sm font-medium text-blue-500 hover:text-blue-700',
        'dark:text-blue-400 dark:hover:text-blue-300',
        'transition-colors duration-200',
        className
      )}
    >
      {children}
    </RedirectRouterLink>
  );
};

export default RedirectLink;
