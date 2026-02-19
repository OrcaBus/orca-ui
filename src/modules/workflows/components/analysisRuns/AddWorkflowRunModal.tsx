import { useState, useMemo, useCallback } from 'react';
import { Dialog } from '@/components/common/dialogs';
import { Table, Column } from '@/components/tables';
import { useWorkflowRunListModel, useWorkflowRunLinkAnalysisRunMutation } from '@/api/workflow';
import { useQueryClient } from '@tanstack/react-query';
import toaster from '@/components/common/toaster';
import { Badge } from '@/components/common/badges';
import { dayjs, TIMESTAMP_FORMAT } from '@/utils/dayjs';
import { DEFAULT_NON_PAGINATE_PAGE_SIZE } from '@/utils/constant';

interface AddWorkflowRunModalProps {
  open: boolean;
  onClose: () => void;
  analysisRunOrcabusId: string;
  onSuccess?: () => void;
}

const AddWorkflowRunModal = ({
  open,
  onClose,
  analysisRunOrcabusId,
  onSuccess,
}: AddWorkflowRunModalProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();

  const { data: workflowRunsData, isFetching } = useWorkflowRunListModel({
    params: {
      query: {
        search: searchQuery || undefined,
        rowsPerPage: DEFAULT_NON_PAGINATE_PAGE_SIZE,
        ordering: '-timestamp',
      },
    },
    reactQuery: {
      enabled: open,
    },
  });

  const { mutateAsync, isPending } = useWorkflowRunLinkAnalysisRunMutation({
    reactQuery: {
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          predicate: (query) =>
            typeof query.queryKey[0] === 'string' && query.queryKey[0].includes('workflowrun'),
        });
        await queryClient.invalidateQueries({
          predicate: (query) =>
            typeof query.queryKey[0] === 'string' && query.queryKey[0].includes('analysisrun'),
        });
      },
    },
  });

  const results = useMemo(() => workflowRunsData?.results ?? [], [workflowRunsData?.results]);
  const linkedWorkflowRunIds = useMemo(
    () =>
      new Set(
        results
          .filter(
            (r) => (r as { analysisRun?: string | null }).analysisRun === analysisRunOrcabusId
          )
          .map((r) => r.orcabusId as string)
      ),
    [results, analysisRunOrcabusId]
  );
  const selectableResults = results.filter((r) => !linkedWorkflowRunIds.has(r.orcabusId as string));
  const selectedCount = Array.from(selectedIds).filter((id) =>
    selectableResults.some((r) => r.orcabusId === id)
  ).length;

  const toggleSelect = useCallback(
    (orcabusId: string) => {
      if (linkedWorkflowRunIds.has(orcabusId)) return;
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (next.has(orcabusId)) {
          next.delete(orcabusId);
        } else {
          next.add(orcabusId);
        }
        return next;
      });
    },
    [linkedWorkflowRunIds]
  );

  const handleAddSelected = async () => {
    const toLink = Array.from(selectedIds).filter((id) =>
      selectableResults.some((r) => r.orcabusId === id)
    );
    if (toLink.length === 0) return;

    try {
      await Promise.all(
        toLink.map((workflowRunOrcabusId) =>
          mutateAsync({
            workflowRunOrcabusId,
            analysisRunOrcabusId,
          })
        )
      );
      toaster.success({ title: 'Workflow runs linked' });
      setSelectedIds(new Set());
      onClose();
      onSuccess?.();
    } catch {
      toaster.error({ title: 'Failed to link workflow runs' });
    }
  };

  const handleClose = () => {
    setSearchQuery('');
    setSelectedIds(new Set());
    onClose();
  };

  const columns: Column[] = useMemo(
    () => [
      {
        header: '',
        accessor: 'orcabusId',
        headerClassName: 'w-12',
        cell: (orcabusId: unknown) => {
          const id = orcabusId as string;
          const isLinked = linkedWorkflowRunIds.has(id);
          return (
            <div className='flex items-center'>
              {isLinked ? (
                <span className='text-xs text-gray-400 dark:text-gray-500'>Already linked</span>
              ) : (
                <input
                  type='checkbox'
                  checked={selectedIds.has(id)}
                  onChange={() => toggleSelect(id)}
                  className='h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700'
                />
              )}
            </div>
          );
        },
      },
      {
        header: 'Workflow Run Name',
        accessor: 'workflowRunName',
        cell: (workflowRunName: unknown) => (workflowRunName as string) || '-',
      },
      {
        header: 'Portal Run ID',
        accessor: 'portalRunId',
        cell: (portalRunId: unknown) => (portalRunId as string) || '-',
      },
      {
        header: 'Execution ID',
        accessor: 'executionId',
        cell: (executionId: unknown) => (executionId as string) || '-',
      },
      {
        header: 'Status',
        accessor: 'currentState',
        cell: (currentState: unknown) => {
          const status = (currentState as { status?: string })?.status || 'unknown';
          return <Badge status={status}>{status.toLowerCase()}</Badge>;
        },
      },
      {
        header: 'Last Modified',
        accessor: 'currentState',
        cell: (currentState: unknown) => {
          const timestamp = (currentState as { timestamp?: string })?.timestamp;
          return timestamp ? dayjs(timestamp).format(TIMESTAMP_FORMAT) : '-';
        },
      },
    ],
    [selectedIds, linkedWorkflowRunIds, toggleSelect]
  );

  return (
    <Dialog
      open={open}
      size='xl'
      title='Add Workflow Runs'
      content={
        <div className='w-full space-y-4 p-1 dark:bg-gray-800'>
          <input
            type='text'
            placeholder='Search workflow runs by name, portal run ID, execution ID…'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100'
          />
          {selectedCount > 0 && (
            <p className='text-sm text-gray-600 dark:text-gray-400'>{selectedCount} selected</p>
          )}
          <div className='max-h-96 overflow-y-auto'>
            <Table
              columns={columns}
              tableData={results}
              inCard={false}
              isFetchingData={isFetching}
            />
          </div>
        </div>
      }
      onClose={handleClose}
      closeBtn={{
        label: 'Cancel',
        onClick: handleClose,
      }}
      confirmBtn={{
        label: isPending ? 'Adding…' : 'Add Selected',
        disabled: selectedCount === 0 || isPending,
        onClick: handleAddSelected,
        className:
          'text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600 shadow-md hover:shadow-lg border-none disabled:opacity-50 disabled:cursor-not-allowed',
      }}
    />
  );
};

export default AddWorkflowRunModal;
