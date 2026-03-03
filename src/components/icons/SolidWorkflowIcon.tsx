import { SVGProps } from 'react';

export const SolidWorkflowIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth={1.5} {...props}>
    {/* First node with checkmark */}
    <rect x='3' y='5' width='4' height='4' rx='1' />
    <path d='M4.5 7l0.8 0.8L7 6.2' strokeLinecap='round' strokeLinejoin='round' />

    {/* Process nodes */}
    <rect x='10' y='5' width='4' height='4' rx='1' />
    <rect x='10' y='15' width='4' height='4' rx='1' />
    <rect x='17' y='10' width='4' height='4' rx='1' />

    {/* Gear icon */}
    <path d='M19 12m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0' strokeLinecap='round' />

    {/* Curved connecting lines */}
    <path
      d='M7 7h3M14 7c2 0 3 1 3 3M14 17c2 0 3-1 3-3'
      strokeLinecap='round'
      className='text-orange-500'
    />

    {/* Vertical connecting lines */}
    <path d='M12 9v6' strokeLinecap='round' className='text-orange-500' />
  </svg>
);
