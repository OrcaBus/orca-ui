/* eslint-disable @typescript-eslint/no-explicit-any */
import CaseLibraryTable from './CaseLibrary';
import CaseSampleTable from './CaseSampleTable';
import CaseLinkLibraryButton from './CaseLinkLibraryButton';
import CaseLinkSampleButton from './CaseLinkSampleButton';

const CaseMetadataTab = ({
  externalEntitySet,
  caseOrcabusId,
}: {
  externalEntitySet: Record<string, any>[];
  caseOrcabusId: string;
}) => {
  return (
    <div className='space-y-8'>
      {/* Libraries Section */}
      <div>
        <div className='mb-2 flex items-center justify-between'>
          <h3 className='text-sm font-semibold text-gray-700 dark:text-gray-300'>Libraries</h3>
          <CaseLinkLibraryButton caseOrcabusId={caseOrcabusId} />
        </div>
        <CaseLibraryTable externalEntitySet={externalEntitySet} caseOrcabusId={caseOrcabusId} />
      </div>

      {/* Samples Section */}
      <div>
        <div className='mb-2 flex items-center justify-between'>
          <h3 className='text-sm font-semibold text-gray-700 dark:text-gray-300'>Samples</h3>
          <CaseLinkSampleButton caseOrcabusId={caseOrcabusId} />
        </div>
        <CaseSampleTable externalEntitySet={externalEntitySet} caseOrcabusId={caseOrcabusId} />
      </div>
    </div>
  );
};

export default CaseMetadataTab;
