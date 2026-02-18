import { PropsWithChildren, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { SpinnerWithText } from '@/components/common/spinner';
// import { ModuleNavbar } from '@/components/navigation/navbar';
// import { runsModuleNavigation } from '@/utils/navigation';
import LocationBreadcrumb from '@/components/navigation/breadcrumbs';
import { DetailedErrorBoundary } from '@/components/common/error';
const RunsModuleLayout = ({ children }: PropsWithChildren) => {
  return (
    <Suspense fallback={<SpinnerWithText text='Loading Runs page ...' />}>
      <div className='flex h-full flex-row'>
        <div className='flex h-full'>
          {/* <ModuleNavbar
            navigation={runsModuleNavigation}
            preferenceStorageKey='runs-module-navbar'
          /> */}
        </div>
        <div className='flex min-w-[450px] flex-1 flex-col overflow-auto overflow-x-auto px-8 py-4'>
          <LocationBreadcrumb className='mb-0' />
          <Suspense fallback={<SpinnerWithText text='Loading Runs page' />}>
            <DetailedErrorBoundary errorTitle='Unable to load Runs page'>
              {children || <Outlet />}
            </DetailedErrorBoundary>
          </Suspense>
        </div>
      </div>
    </Suspense>
  );
};

export default RunsModuleLayout;
