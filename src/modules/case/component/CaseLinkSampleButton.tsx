import { useQueryMetadataSampleModel } from '@/api/metadata';
import { getSampleTableColumn } from '@/modules/lab/components/sample/utils';
import CaseLinkEntityButton from './CaseLinkEntityButton';

function CaseLinkSampleButton({ caseOrcabusId }: { caseOrcabusId: string }) {
  return (
    <CaseLinkEntityButton
      useEntityQuery={useQueryMetadataSampleModel}
      caseOrcabusId={caseOrcabusId}
      entityName={'Sample'}
      tableSelectionColumn={getSampleTableColumn({
        headerClassName: 'bg-gray-50 dark:bg-gray-800',
        cellClassName: 'bg-white dark:bg-gray-900',
      })}
      processDataBeforeTable={(data) =>
        data.map((smp) => ({
          sampleIds: {
            sampleOrcabusId: smp.orcabusId,
            sampleId: smp.sampleId ?? '-',
          },
          sampleExternalId: smp.externalSampleId ?? '-',
          sampleSource: smp.source ?? '-',
        }))
      }
      extractEntityFromRow={(row: unknown) => {
        const { sampleIds } = row as {
          sampleIds: { sampleOrcabusId: string; sampleId: string };
        };
        return {
          orcabusId: sampleIds.sampleOrcabusId,
          displayId: sampleIds.sampleId,
        };
      }}
    />
  );
}

export default CaseLinkSampleButton;
