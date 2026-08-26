import { Table } from '@/components/tables';
import { components } from '@/api/types/case';

type PendingExternalEntity = components['schemas']['PendingExternalEntity'];

const CasePendingEntitiesTab = ({
  pendingExternalEntities,
}: {
  pendingExternalEntities: PendingExternalEntity[];
}) => {
  const flatData = pendingExternalEntities.map((entity) => ({
    orcabusId: entity.orcabusId,
    alias: entity.alias ?? '-',
    type: entity.type ?? '-',
    serviceName: entity.serviceName ?? '-',
  }));

  return (
    <div className='space-y-4'>
      <div className='rounded-md border border-amber-200 bg-amber-50 p-4 dark:border-amber-700 dark:bg-amber-900/20'>
        <h3 className='text-sm font-semibold text-amber-800 dark:text-amber-300'>
          Pending External Entities
        </h3>
        <p className='mt-1 text-sm text-amber-700 dark:text-amber-400'>
          When a case is synced from REDCap, it may reference samples that do not yet exist on the
          tracking sheet or metadata manager. These unresolved references are listed here as pending
          entities. Once the metadata service confirms their existence, they will automatically move
          to the Metadata tab as linked entities.
        </p>
      </div>

      {flatData.length === 0 ? (
        <p className='text-sm text-gray-500 dark:text-gray-400'>
          No pending external entities for this case.
        </p>
      ) : (
        <Table
          inCard={false}
          columns={[
            {
              header: 'Alias',
              accessor: 'alias',
            },
            {
              header: 'Type',
              accessor: 'type',
            },
            {
              header: 'Service',
              accessor: 'serviceName',
            },
          ]}
          tableData={flatData}
        />
      )}
    </div>
  );
};

export default CasePendingEntitiesTab;
