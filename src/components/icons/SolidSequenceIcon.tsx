import { SVGProps } from 'react';

export const SolidSequenceIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth={1.5} {...props}>
    {/* DNA Sequence Bars - Like a sequencing readout */}
    <path d='M4 6h2v12H4zM8 9h2v6H8zM12 4h2v16h-2zM16 8h2v8h-2zM20 7h2v10h-2z' />

    {/* Base Letters */}
    <text x='5' y='20' fontSize='3' fill='currentColor' textAnchor='middle'>
      A
    </text>
    <text x='9' y='20' fontSize='3' fill='currentColor' textAnchor='middle'>
      T
    </text>
    <text x='13' y='20' fontSize='3' fill='currentColor' textAnchor='middle'>
      G
    </text>
    <text x='17' y='20' fontSize='3' fill='currentColor' textAnchor='middle'>
      C
    </text>
  </svg>
);
