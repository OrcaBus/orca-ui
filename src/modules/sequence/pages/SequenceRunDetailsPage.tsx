import SequenceRunDetailsHeader from '../components/sequenceRuns/SequenceRunDetailsHeader';
import SequenceRunDetailsSidebar from '../components/sequenceRuns/SequenceRunDetailsSidebar';
import { SequenceRunProvider } from '../components/sequenceRuns/SequenceRunContext';
import { SideBarLayout } from '@/components/common/sidebar';
import { Outlet } from 'react-router-dom';

const SequenceRunDetailsMainContent = () => {
  return (
    <div className='flex flex-col gap-4'>
      <SequenceRunDetailsHeader />
      <Outlet />
    </div>
  );
};

const SequenceRunDetailsPage = () => {
  return (
    <SequenceRunProvider>
      <div className='no-scrollbar flex min-h-screen w-full overflow-y-auto'>
        <div className='grow'>
          <SideBarLayout
            main={
              <div className='flex flex-col gap-4'>
                <SequenceRunDetailsMainContent />
              </div>
            }
            mainClassName='no-scrollbar'
            sideBar={<SequenceRunDetailsSidebar />}
            sideBarClassName='overflow-y-auto no-scrollbar'
            sideBarPosition='right'
          />
        </div>
      </div>
    </SequenceRunProvider>
  );
};

export default SequenceRunDetailsPage;
