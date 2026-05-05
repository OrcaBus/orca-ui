import { classNames } from '@/utils/commonUtils';
import { Button } from '@/components/common/buttons';
import { components } from '@/api/types/case';
import { inputClassName, labelClassName } from '@/components/common/input';
import { useState } from 'react';

type StudyTypeEnum = components['schemas']['StudyTypeEnum'];
const STUDY_TYPE_OPTIONS: StudyTypeEnum[] = ['clinical', 'research'];
type CaseTypeEnum = components['schemas']['TypeEnum'];
const CASE_TYPE_OPTIONS: CaseTypeEnum[] = ['wgts', 'cttso'];

type Props = {
  initialData?: components['schemas']['CaseDetailRequest'];
  onSubmit: (data: components['schemas']['CaseDetailRequest']) => void;
  onCancel: () => void;
  isPending?: boolean;
  submitLabel?: string;
};

function CaseForm({
  initialData,
  onSubmit,
  onCancel,
  isPending,
  submitLabel = 'Save Changes',
}: Props) {
  const [draftDataUpdate, setDraftDataUpdate] = useState<
    components['schemas']['CaseDetailRequest']
  >(
    initialData ?? {
      requestFormId: '',
      description: '',
      type: 'wgts',
      studyType: 'research',
      isReportRequired: false,
      isNataAccredited: false,
      links: {},
      alias: [],
    }
  );

  const caseDataOnChange = (field: keyof typeof draftDataUpdate, value: string) => {
    setDraftDataUpdate((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className='rounded-xl bg-white shadow-sm ring-1 ring-gray-900/5 dark:bg-gray-900 dark:ring-white/10'>
      <div className='p-6 sm:p-8'>
        {/* Form Fields */}
        <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
          {/* Request Form Id */}
          <div className='sm:col-span-2 lg:col-span-3'>
            <label htmlFor='requestFormId' className={labelClassName}>
              Request Form Id
            </label>
            <input
              id='requestFormId'
              type='text'
              value={draftDataUpdate.requestFormId ?? ''}
              onChange={(e) => caseDataOnChange('requestFormId', e.target.value)}
              placeholder='Enter case requestFormId'
              className={inputClassName}
            />
          </div>

          {/* Type */}
          <div>
            <label htmlFor='type' className={labelClassName}>
              Type
            </label>
            <select
              id='type'
              value={draftDataUpdate.type}
              onChange={(e) =>
                setDraftDataUpdate((prev) => ({
                  ...prev,
                  type: (e.target.value as components['schemas']['TypeEnum']) || null,
                }))
              }
              className={inputClassName}
            >
              {CASE_TYPE_OPTIONS.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          {/* Study Type */}
          <div>
            <label htmlFor='studyType' className={labelClassName}>
              Study Type
            </label>
            <select
              id='studyType'
              value={draftDataUpdate.studyType ?? ''}
              onChange={(e) =>
                setDraftDataUpdate((prev) => ({
                  ...prev,
                  studyType: e.target.value as StudyTypeEnum,
                }))
              }
              className={inputClassName}
            >
              {STUDY_TYPE_OPTIONS.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          {/* Links */}
          <div className='sm:col-span-2 lg:col-span-3'>
            <label className={labelClassName}>Links</label>
            <div className='space-y-2'>
              {Object.entries(draftDataUpdate.links ?? {}).map(([key, value], index) => (
                <div key={index} className='flex items-center gap-2'>
                  <input
                    type='text'
                    value={key}
                    onChange={(e) => {
                      const entries = Object.entries(draftDataUpdate.links ?? {});
                      entries[index] = [e.target.value, value as string];
                      setDraftDataUpdate((prev) => ({
                        ...prev,
                        links: Object.fromEntries(entries),
                      }));
                    }}
                    placeholder='Link name'
                    className={classNames(inputClassName, 'flex-1')}
                  />
                  <input
                    type='url'
                    value={value as string}
                    onChange={(e) => {
                      const entries = Object.entries(draftDataUpdate.links ?? {});
                      entries[index] = [key, e.target.value];
                      setDraftDataUpdate((prev) => ({
                        ...prev,
                        links: Object.fromEntries(entries),
                      }));
                    }}
                    placeholder='https://...'
                    className={classNames(inputClassName, 'flex-1')}
                  />
                  <button
                    type='button'
                    onClick={() => {
                      const entries = Object.entries(draftDataUpdate.links ?? {}).filter(
                        (_, i) => i !== index
                      );
                      setDraftDataUpdate((prev) => ({
                        ...prev,
                        links: Object.fromEntries(entries),
                      }));
                    }}
                    className='rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30'
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type='button'
                onClick={() => {
                  const entries = Object.entries(draftDataUpdate.links ?? {});
                  entries.push(['', '']);
                  setDraftDataUpdate((prev) => ({
                    ...prev,
                    links: Object.fromEntries(entries),
                  }));
                }}
                className='rounded-md bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30'
              >
                + Add Link
              </button>
            </div>
          </div>

          {/* Report Required */}
          <div className='col-span-full'>
            <div className='flex items-center gap-3 pt-3'>
              <input
                id='isReportRequired'
                type='checkbox'
                checked={draftDataUpdate.isReportRequired ?? false}
                onChange={(e) =>
                  setDraftDataUpdate((prev) => ({ ...prev, isReportRequired: e.target.checked }))
                }
                className='h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500'
              />
              <label htmlFor='isReportRequired' className={labelClassName}>
                Report Required
              </label>
            </div>
          </div>

          {/* NATA Accredited */}
          <div className='col-span-full'>
            <div className='flex items-center gap-3 pt-3'>
              <input
                id='isNataAccredited'
                type='checkbox'
                checked={draftDataUpdate.isNataAccredited ?? false}
                onChange={(e) =>
                  setDraftDataUpdate((prev) => ({ ...prev, isNataAccredited: e.target.checked }))
                }
                className='h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500'
              />
              <label htmlFor='isNataAccredited' className={labelClassName}>
                NATA Accredited
              </label>
            </div>
          </div>

          {/* Alias */}
          <div className='sm:col-span-2 lg:col-span-3'>
            <label className={labelClassName}>Alias</label>
            <div className='space-y-2'>
              {(draftDataUpdate.alias ?? []).map((item, index) => (
                <div key={index} className='flex items-center gap-2'>
                  <input
                    type='text'
                    value={item}
                    onChange={(e) => {
                      const newAlias = [...(draftDataUpdate.alias ?? [])];
                      newAlias[index] = e.target.value;
                      setDraftDataUpdate((prev) => ({ ...prev, alias: newAlias }));
                    }}
                    placeholder='Enter alias'
                    className={classNames(inputClassName, 'flex-1')}
                  />
                  <button
                    type='button'
                    onClick={() => {
                      const newAlias = (draftDataUpdate.alias ?? []).filter((_, i) => i !== index);
                      setDraftDataUpdate((prev) => ({ ...prev, alias: newAlias }));
                    }}
                    className='rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30'
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type='button'
                onClick={() => {
                  setDraftDataUpdate((prev) => ({
                    ...prev,
                    alias: [...(prev.alias ?? []), ''],
                  }));
                }}
                className='rounded-md bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30'
              >
                + Add Alias
              </button>
            </div>
          </div>

          {/* Description */}
          <div className='sm:col-span-2 lg:col-span-3'>
            <label htmlFor='description' className={labelClassName}>
              Description
            </label>
            <textarea
              id='description'
              value={draftDataUpdate.description ?? ''}
              onChange={(e) => caseDataOnChange('description', e.target.value)}
              placeholder='Enter case description'
              rows={4}
              className={classNames(inputClassName, 'resize-vertical')}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className='mt-8 flex items-center justify-end gap-3 pt-6'>
          <Button onClick={onCancel} type='red' size='md' className='px-6'>
            Cancel
          </Button>
          <Button
            onClick={() => onSubmit(draftDataUpdate)}
            type='green'
            size='md'
            disabled={isPending}
            className='px-6 shadow-sm transition-shadow duration-200 hover:shadow-md'
          >
            {submitLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default CaseForm;
