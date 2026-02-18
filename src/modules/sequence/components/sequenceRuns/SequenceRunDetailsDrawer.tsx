import { FC, useState, useEffect, useMemo, startTransition } from 'react';
import { useSequenceRunDetailModel } from '@/api/sequenceRun';
import { SideDrawer } from '@/components/common/drawers';
import { classNames, sleep } from '@/utils/commonUtils';
import { JsonToList } from '@/components/common/json-to-table';
import SequenceRunDetailsTimeline from './SequenceRunDetailsTimeline';
import { Accordion } from '@/components/common/accordion';
import SequenceRunDetailsActions from './SequenceRunDetailsActions';

interface SequenceRunDetailsDrawerProps {
  selectedSequenceRunId: string;
  onCloseDrawer?: () => void;
}

const SequenceRunDetailsDrawer: FC<SequenceRunDetailsDrawerProps> = ({
  selectedSequenceRunId,
  onCloseDrawer,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const { data: sequenceRunDetail, isFetching: isFetchingSequenceRunDetail } =
    useSequenceRunDetailModel({
      params: { path: { orcabusId: selectedSequenceRunId } },
      reactQuery: {
        enabled: !!selectedSequenceRunId,
      },
    });

  useEffect(() => {
    if (selectedSequenceRunId) {
      startTransition(() => {
        setIsOpen(true);
      });
    }
  }, [selectedSequenceRunId]);

  const selectedSequenceRun = sequenceRunDetail;

  const sequenceRunDetailData = useMemo(() => {
    return selectedSequenceRun
      ? Object.fromEntries(
          Object.entries(selectedSequenceRun).map(([key, value]) => [
            key,
            value?.toString() ?? null,
          ])
        )
      : null;
  }, [selectedSequenceRun]);

  const handleCloseDrawer = () => {
    // call onCloseDrawer func after close drawer closed
    setIsOpen(false);
    sleep(300).then(() => {
      if (onCloseDrawer) {
        onCloseDrawer();
      }
    });
  };

  return (
    <SideDrawer
      title='Sequence Run Details'
      subtitle={selectedSequenceRun?.sequenceRunName || ''}
      isOpen={isOpen}
      onClose={handleCloseDrawer}
      size='medium'
    >
      <div className='flex h-full flex-col gap-4 overflow-y-auto'>
        <Accordion
          title='Details'
          defaultOpen={false}
          chevronPosition='right'
          className={classNames(
            'rounded-lg',
            'bg-linear-to-r from-white via-gray-50/80 to-gray-100/50',
            'dark:from-gray-900 dark:via-gray-800/80 dark:to-gray-800/50',
            'shadow-xs hover:shadow-md',
            'ring-1 ring-gray-200/50 dark:ring-gray-700/50',
            'transition-all duration-200 ease-in-out',
            'group'
          )}
          buttonClassName={classNames(
            'border-0',
            'bg-linear-to-r from-blue-50/90 to-transparent',
            'dark:from-blue-900/30 dark:to-transparent',
            'group-hover:from-blue-100/80 dark:group-hover:from-blue-800/40',
            'transition-all duration-300'
          )}
        >
          <JsonToList data={sequenceRunDetailData} isFetchingData={isFetchingSequenceRunDetail} />
        </Accordion>

        <Accordion
          title='Timeline'
          defaultOpen={true}
          chevronPosition='right'
          className={classNames(
            'rounded-lg',
            'bg-linear-to-r from-white via-gray-50/80 to-gray-100/50',
            'dark:from-gray-900 dark:via-gray-800/80 dark:to-gray-800/50',
            'shadow-xs hover:shadow-md',
            'ring-1 ring-gray-200/50 dark:ring-gray-700/50',
            'transition-all duration-200 ease-in-out',
            'group'
          )}
          buttonClassName={classNames(
            'border-0',
            'bg-linear-to-r from-blue-50/90 to-transparent',
            'dark:from-blue-900/30 dark:to-transparent',
            'group-hover:from-blue-100/80 dark:group-hover:from-blue-800/40',
            'transition-all duration-300'
          )}
        >
          <SequenceRunDetailsActions />
          <SequenceRunDetailsTimeline selectedSequenceRunId={selectedSequenceRunId} />
        </Accordion>
      </div>
    </SideDrawer>
  );
};

export default SequenceRunDetailsDrawer;
