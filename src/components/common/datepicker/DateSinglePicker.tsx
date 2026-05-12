/* eslint-disable @typescript-eslint/no-explicit-any */

import { FC, useEffect, useState } from 'react';
import Flatpickr from 'react-flatpickr';
import type { DateTimePickerProps } from 'react-flatpickr';
import { dayjs } from '@/utils/dayjs';
import { classNames } from '@/utils/commonUtils';

interface DateSinglePickerProps {
  align?: string;
  selectedDate: string | null;
  onDateChange: (date: string | null) => void;
  className?: string;
  maxDate?: Date | string;
}

const DateSinglePicker: FC<DateSinglePickerProps> = ({
  align,
  selectedDate,
  onDateChange,
  className,
  maxDate,
}) => {
  const [selectedStartDate, setSelectedStartDate] = useState<string | null>(selectedDate);

  useEffect(() => {
    setSelectedStartDate(selectedDate);
  }, [selectedDate]);

  const options: Partial<DateTimePickerProps['options']> = {
    mode: 'single',
    static: true,
    monthSelectorType: 'static',
    dateFormat: 'j M Y',
    maxDate: maxDate,
    disableMobile: true,
    // defaultDate: `${dayjs().subtract(1, 'month').format('DD/MM/YYYY')} to ${new Date().toLocaleDateString()}`,
    prevArrow:
      '<svg class="fill-current" width="7" height="11" viewBox="0 0 7 11"><path d="M5.4 10.8l1.4-1.4-4-4 4-4L5.4 0 0 5.4z" /></svg>',
    nextArrow:
      '<svg class="fill-current" width="7" height="11" viewBox="0 0 7 11"><path d="M1.4 10.8L0 9.4l4-4-4-4L1.4 0l5.4 5.4z" /></svg>',
    onReady: (_selectedDates, dateStr, instance) => {
      (instance.element as HTMLInputElement).value = dateStr.replace('to', '-');
      const customClass = align ? align : '';
      instance.calendarContainer.classList.add(`flatpickr-${customClass}`);
      // console.log('on ready', selectedDates);
    },
    onValueUpdate: (_selectedDates, dateStr, instance) => {
      (instance.element as HTMLInputElement).value = dateStr.replace('to', '-');
      // console.log('on value update', selectedDates);
    },
    onChange: (selectedDates) => {
      if (selectedDates.length === 1) {
        const formattedDate = dayjs(selectedDates[0]).utc(true).format();
        onDateChange(formattedDate);
      }
    },
  };

  const FlatpickrComponent = Flatpickr as any;

  return (
    <div className='relative'>
      <FlatpickrComponent
        className={classNames(
          'form-input hover:bg-magpie-light-25 w-[15.5rem] rounded-lg border-0 bg-white py-1.5 pl-9! font-medium text-gray-900 ring-1 ring-gray-300 ring-inset placeholder:text-gray-400 hover:text-slate-600 focus:ring-2 focus:ring-indigo-600 focus:ring-inset sm:text-sm sm:leading-6 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-200',
          className
        )}
        options={options}
        value={selectedStartDate ? new Date(selectedStartDate) : ''}
      />
      <div className='pointer-events-none absolute inset-0 right-auto flex items-center'>
        <svg
          className='ml-3 h-4 w-4 fill-current text-slate-500 dark:text-slate-400'
          viewBox='0 0 16 16'
        >
          <path d='M15 2h-2V0h-2v2H9V0H7v2H5V0H3v2H1a1 1 0 00-1 1v12a1 1 0 001 1h14a1 1 0 001-1V3a1 1 0 00-1-1zm-1 12H2V6h12v8z' />
        </svg>
      </div>
    </div>
  );
};

export default DateSinglePicker;
