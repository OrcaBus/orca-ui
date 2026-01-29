import { useQueryMetadataLibraryModel } from '@/api/metadata';
import { getLibraryTableColumn } from '@/modules/lab/components/library/utils';
import { processLibraryResults } from '@/modules/lab/components/library/LibraryListAPITable';
import CaseLinkEntityButton from './CaseLinkEntityButton';

function CaseLinkLibraryButton({ caseOrcabusId }: { caseOrcabusId: string }) {
  return (
    <CaseLinkEntityButton
      useEntityQuery={useQueryMetadataLibraryModel}
      caseOrcabusId={caseOrcabusId}
      entityName={'Library'}
      tableSelectionColumn={getLibraryTableColumn({
        headerClassName: 'bg-gray-50 dark:bg-gray-800',
        cellClassName: 'bg-white dark:bg-gray-900',
      })}
      processDataBeforeTable={processLibraryResults}
      extractEntityFromRow={(row: unknown) => {
        const { libraryIds } = row as {
          libraryIds: { libraryOrcabusId: string; libraryId: string };
        };
        return {
          orcabusId: libraryIds.libraryOrcabusId,
          displayId: libraryIds.libraryId,
        };
      }}
    />
  );
}

export default CaseLinkLibraryButton;
