/* eslint-disable @typescript-eslint/no-explicit-any */
import CaseSequenceRunTable from './CaseSequenceRun';
import WorkflowRunTable from './CaseWorkflowRun';
import CaseLinkSequenceRunButton from './CaseLinkSequenceRunButton';
import CaseLinkWorkflowRunButton from './CaseLinkWorkflowRunButton';

const CaseRunsTab = ({
  externalEntitySet,
  caseOrcabusId,
}: {
  externalEntitySet: Record<string, any>[];
  caseOrcabusId: string;
}) => {
  return (
    <div className='space-y-8'>
      {/* Sequence Runs Section */}
      <div>
        <div className='mb-2 flex items-center justify-between'>
          <h3 className='text-sm font-semibold text-gray-700 dark:text-gray-300'>Sequence Runs</h3>
          <CaseLinkSequenceRunButton caseOrcabusId={caseOrcabusId} />
        </div>
        <CaseSequenceRunTable externalEntitySet={externalEntitySet} caseOrcabusId={caseOrcabusId} />
      </div>

      {/* Workflow Runs Section */}
      <div>
        <div className='mb-2 flex items-center justify-between'>
          <h3 className='text-sm font-semibold text-gray-700 dark:text-gray-300'>Workflow Runs</h3>
          <CaseLinkWorkflowRunButton caseOrcabusId={caseOrcabusId} />
        </div>
        <WorkflowRunTable externalEntitySet={externalEntitySet} caseOrcabusId={caseOrcabusId} />
      </div>
    </div>
  );
};

export default CaseRunsTab;
