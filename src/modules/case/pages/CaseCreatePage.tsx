import { casePath, useMutationCaseCreate } from '@/api/case';
import { useNavigate } from 'react-router-dom';
import { components } from '@/api/types/case';
import { SpinnerWithText } from '@/components/common/spinner';
import toaster from '@/components/common/toaster';
import { DetailedErrorBoundary } from '@/components/common/error';
import { useQueryClient } from '@tanstack/react-query';
import CaseForm from '../component/CaseForm';

export default function CaseCreatePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { isPending, isError, error, mutate } = useMutationCaseCreate({
    reactQuery: {
      onSuccess: async (data) => {
        await queryClient.invalidateQueries({
          queryKey: ['GET', casePath],
        });
        toaster.success({ title: 'Case created successfully' });
        navigate(`/case/${data.orcabusId}`, { replace: true });
      },
    },
  });

  const handleSubmit = (data: components['schemas']['CaseDetailRequest']) => {
    mutate(data);
  };

  const handleCancel = () => {
    navigate(`/case/`);
  };

  if (isPending) {
    return <SpinnerWithText text='Creating case ...' />;
  }

  if (isError) {
    throw error;
  }

  return (
    <div className='mx-auto max-w-7xl p-6'>
      <div className='mb-8'>
        <div className='mb-2 flex items-center gap-3'>
          <h1 className='text-3xl font-bold text-slate-900 dark:text-white'>Create New Case</h1>
        </div>
        <p className='text-sm text-slate-600 dark:text-slate-400'>
          Fill in the details below to create a new case.
        </p>
      </div>
      <DetailedErrorBoundary>
        <CaseForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isPending={isPending}
          submitLabel='Create Case'
        />
      </DetailedErrorBoundary>
    </div>
  );
}
