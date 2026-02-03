import { caseDetailPath, useMutationCaseUpdate, useQueryCaseDetailObject } from '@/api/case';
import { useNavigate, useParams } from 'react-router-dom';
import { components } from '@/api/types/case';
import { SpinnerWithText } from '@/components/common/spinner';
import toaster from '@/components/common/toaster';
import { DetailedErrorBoundary } from '@/components/common/error';
import { useQueryClient } from '@tanstack/react-query';
import CaseForm from '../component/CaseForm';

export default function CaseEditPage() {
  const { caseOrcabusId } = useParams();
  if (!caseOrcabusId) {
    throw new Error('No case id in URL path!');
  }

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const caseModel = useQueryCaseDetailObject({
    params: { path: { orcabusId: caseOrcabusId } },
  });
  const caseData = caseModel.data;

  const { isPending, isError, error, mutate } = useMutationCaseUpdate({
    orcabusId: caseOrcabusId,
    reactQuery: {
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: ['GET', caseDetailPath],
        });
        toaster.success({ title: 'Changes saved' });
        navigate(`/case/${caseOrcabusId}`, { replace: true });
      },
    },
  });

  const handleSubmit = (data: components['schemas']['PatchedCaseDetailRequest']) => {
    mutate(data);
  };

  const handleCancel = () => {
    navigate(`/case/${caseOrcabusId}`);
  };

  if (isPending) {
    return <SpinnerWithText text='Saving changes ...' />;
  }

  if (isError) {
    throw error;
  }

  return (
    <div className='mx-auto max-w-7xl p-6'>
      <div className='mb-8'>
        <div className='mb-2 flex items-center gap-3'>
          <h1 className='text-3xl font-bold text-slate-900 dark:text-white'>Edit Case</h1>
        </div>
        <p className='text-sm text-slate-600 dark:text-slate-400'>
          Update case details for{' '}
          <span className='inline-flex items-center rounded-md bg-blue-50 px-2.5 py-1 font-mono text-sm font-semibold text-blue-700 ring-1 ring-blue-700/10 ring-inset dark:bg-blue-900/30 dark:text-blue-300 dark:ring-blue-400/30'>
            {caseOrcabusId}
          </span>
        </p>
      </div>
      <DetailedErrorBoundary>
        <CaseForm
          initialData={{
            title: caseData.title,
            description: caseData.description,
            type: caseData.type,
            creationStatus: caseData.creationStatus,
            trelloUrl: caseData.trelloUrl,
            alias: caseData.alias ?? [],
          }}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isPending={isPending}
          submitLabel='Save Changes'
        />
      </DetailedErrorBoundary>
    </div>
  );
}
