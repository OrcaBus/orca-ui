import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import { classNames } from '@/utils/commonUtils';
import { useState } from 'react';
import {
  PRIMARY_DATASETS_OPTION,
  EXTENDED_DATASETS_OPTION,
  PAN_CANCER_DATASETS_OPTION,
  TISSUE_CODES,
} from '@/utils/rnasumUtils';

interface RNASUMOption {
  project: string;
  name: string;
  tissue_code: string;
  samples_no: string;
}

interface RNASUMSelectProps {
  availableOptions: string[];
  selectedValue: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
  examples?: string[];
}

const RNASUMSelect = ({
  availableOptions,
  selectedValue,
  onChange,
  placeholder = 'Select dataset...',
  examples = [],
}: RNASUMSelectProps) => {
  const [query, setQuery] = useState('');

  const options: RNASUMOption[] = [
    ...PRIMARY_DATASETS_OPTION,
    ...EXTENDED_DATASETS_OPTION,
    ...PAN_CANCER_DATASETS_OPTION,
  ].filter((option) => availableOptions.includes(option.project));

  const selectedOption = options.find((option) => option.project === selectedValue);

  const filteredOptions =
    query === ''
      ? options
      : options.filter(
          (option) =>
            option.project.toLowerCase().includes(query.toLowerCase()) ||
            option.name.toLowerCase().includes(query.toLowerCase())
        );
  const handleChange = (value: RNASUMOption | null) => {
    if (value) {
      onChange(value.project);
    }
  };

  return (
    <div className='w-full'>
      <Combobox value={selectedOption} onChange={handleChange} onClose={() => setQuery('')}>
        <div className='relative'>
          <ComboboxInput
            className={classNames(
              'w-full rounded-lg py-2 pr-3 pl-3 text-sm',
              'bg-white dark:bg-gray-800',
              'text-gray-900 dark:text-white',
              'border border-gray-200 dark:border-gray-700',
              'placeholder-gray-500 dark:placeholder-gray-400',
              'focus:outline-hidden data-focus:ring-2 data-focus:ring-blue-500',
              'transition duration-150'
            )}
            displayValue={(val: RNASUMOption) => (val ? val.project : placeholder)}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={placeholder}
          />
          <ComboboxButton className='group absolute inset-y-0 right-0 px-2.5'>
            <ChevronUpDownIcon
              className={classNames(
                'h-5 w-5',
                'text-gray-400 group-data-hover:text-gray-600',
                'dark:text-gray-500 dark:group-data-hover:text-gray-300'
              )}
            />
          </ComboboxButton>
        </div>

        <ComboboxOptions
          anchor='bottom'
          transition
          className={classNames(
            'absolute z-10 mt-1 w-[var(--input-width)]',
            'max-h-60 overflow-auto rounded-lg',
            'bg-white dark:bg-gray-800',
            'p-1 shadow-lg',
            'ring-1 ring-black/5 dark:ring-white/10',
            '[--anchor-gap:0.25rem]',
            'transition duration-100',
            'data-leave:data-closed:opacity-0',
            'scrollbar-thin scrollbar-track-transparent',
            'scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-600'
          )}
        >
          {/* Table Header */}
          <div className='grid grid-cols-12 gap-2 border-b border-gray-200 py-2 pr-7 pl-3 dark:border-gray-700'>
            {' '}
            {/* Empty header for checkbox column - 8.33% */}
            <div className='col-span-2 pl-12 text-xs font-medium text-gray-500 dark:text-gray-400'>
              Project
            </div>{' '}
            {/* 16.67% */}
            <div className='col-span-7 text-xs font-medium text-gray-500 dark:text-gray-400'>
              Name
            </div>{' '}
            {/* 41.67% */}
            <div className='col-span-2 text-xs font-medium text-gray-500 dark:text-gray-400'>
              Tissue Code
            </div>{' '}
            {/* 16.67% */}
            <div className='col-span-1 text-xs font-medium text-gray-500 dark:text-gray-400'>
              Samples No
            </div>{' '}
            {/* 16.67% */}
          </div>

          {/* Table Content */}
          <div className='max-h-80 overflow-y-auto'>
            {filteredOptions.length === 0 && query !== '' ? (
              <div className='px-3 py-2 text-sm text-gray-500 dark:text-gray-400'>
                Nothing found.
              </div>
            ) : (
              filteredOptions.map((option, idx) => (
                <ComboboxOption
                  key={idx}
                  value={option}
                  className={classNames(
                    'grid grid-cols-12 gap-2',
                    'px-4 py-2 select-none',
                    'text-gray-900 dark:text-gray-100',
                    'data-focus:bg-blue-50 dark:data-focus:bg-blue-900/50',
                    'border-b border-gray-100 last:border-0 dark:border-gray-800',
                    'transition-colors duration-75',
                    'hover:bg-gray-50 dark:hover:bg-gray-800',
                    'cursor-pointer',
                    option.project === selectedValue && 'bg-blue-50 dark:bg-blue-900/50'
                  )}
                >
                  {/* <div className='col-span-1 flex items-center justify-center'>
                    <CheckIcon
                      className={classNames(
                        'size-4',
                        'shrink-0',
                        'text-gray-300 dark:text-gray-600',
                        'group-data-selected:visible group-data-selected:text-blue-500 dark:group-data-selected:text-blue-400'
                      )}
                    />
                  </div> */}
                  <div className='col-span-2 flex flex-row gap-4 pl-4'>
                    <CheckIcon
                      className={classNames(
                        'invisible size-4',
                        'shrink-0',
                        'text-gray-300 dark:text-gray-600',
                        option.project === selectedValue &&
                          'visible text-blue-500 dark:text-blue-400'
                      )}
                    />

                    <div
                      className={classNames(
                        'text-xs',
                        option.project === selectedValue && 'font-medium',
                        'group-data-focus:text-blue-900 dark:group-data-focus:text-blue-100',
                        'truncate'
                      )}
                    >
                      {option.project}
                    </div>
                  </div>

                  <span
                    className={classNames(
                      'col-span-7',
                      'text-xs',
                      option.name === selectedValue && 'font-medium',
                      'group-data-focus:text-blue-900 dark:group-data-focus:text-blue-100',
                      'truncate'
                    )}
                  >
                    {option.name}
                  </span>
                  <span
                    className={classNames(
                      'col-span-2',
                      'text-xs',
                      option.tissue_code === selectedValue && 'font-medium',
                      'group-data-focus:text-blue-900 dark:group-data-focus:text-blue-100',
                      'truncate'
                    )}
                  >
                    {option.tissue_code}
                  </span>
                  <span
                    className={classNames(
                      'col-span-1',
                      'text-xs',
                      option.samples_no === selectedValue && 'font-medium',
                      'group-data-focus:text-blue-900 dark:group-data-focus:text-blue-100',
                      'truncate'
                    )}
                  >
                    {option.samples_no}
                  </span>
                </ComboboxOption>
              ))
            )}
          </div>
        </ComboboxOptions>
      </Combobox>

      {/* Example Datasets */}
      {examples.length > 0 && (
        <div className='mt-2 flex flex-row items-center gap-1'>
          <span className='text-xs font-medium text-gray-500 dark:text-gray-400'>
            Example datasets:
          </span>
          <div className='flex flex-wrap gap-1.5'>
            {examples.map((example) => (
              <button
                key={example}
                onClick={() => {
                  onChange(example);
                  setQuery('');
                }}
                className={classNames(
                  'rounded-md px-2 py-1 text-xs',
                  'bg-gray-100 dark:bg-gray-800',
                  'text-gray-700 dark:text-gray-300',
                  'hover:bg-gray-200 dark:hover:bg-gray-700',
                  'data-focus:ring-2 data-focus:ring-blue-500',
                  'transition-colors duration-150'
                )}
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tissue Codes */}
      {TISSUE_CODES.length > 0 && (
        <div className='mt-2 flex flex-row items-center gap-1'>
          <span className='text-xs font-medium text-gray-500 dark:text-gray-400'>
            Tissue Codes:
          </span>
          <div className='flex flex-wrap gap-1.5'>
            {TISSUE_CODES.map((tissueCode, index) => (
              <div
                key={index}
                className={classNames(
                  'flex items-center gap-1 rounded-md px-2 py-1',
                  'bg-gray-100 dark:bg-gray-800',
                  'text-gray-700 dark:text-gray-300',
                  'text-xs'
                )}
              >
                <span className='font-medium'>{tissueCode.code}</span>
                <span className='text-gray-400'>-</span>
                <span>{tissueCode.definition}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RNASUMSelect;
