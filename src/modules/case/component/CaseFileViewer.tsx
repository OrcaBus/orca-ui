/* eslint-disable @typescript-eslint/no-explicit-any */
import { useWorkflowRunListModel } from '@/api/workflow';
import { SpinnerWithText } from '@/components/common/spinner';
import FileWorkflowViewer from '@/modules/files/components/FileWorkflowViewer';
import { WORKFLOW_ANALYSIS_TABLE } from '@/modules/lab/components/library/LibraryAnalysisReportTable';
import { DEFAULT_NON_PAGINATE_PAGE_SIZE } from '@/utils/constant';

const WGS_WORKFLOW = ['sash', 'tumor-normal', 'dragen-wgts-dna'];
const WTS_WORKFLOW = ['rnasum', 'wts', 'dragen-wgts-rna'];
const CTTSO_WORKFLOW = ['dragen-tso500-ctDNA', 'cttsov2'];

const getFileViewerWorkflowProps = (wfrName: string) => {
  if (wfrName == 'sash') {
    return WORKFLOW_ANALYSIS_TABLE['sash'];
  }
  if (['tumor-normal', 'dragen-wgts-dna'].includes(wfrName)) {
    return WORKFLOW_ANALYSIS_TABLE['tumor-normal'];
  }
  if (wfrName == 'rnasum') {
    return WORKFLOW_ANALYSIS_TABLE['rnasum'];
  }
  if (['wts', 'dragen-wgts-rna'].includes(wfrName)) {
    return WORKFLOW_ANALYSIS_TABLE['wts'];
  }
  if (['dragen-tso500-ctDNA', 'cttsov2'].includes(wfrName)) {
    return WORKFLOW_ANALYSIS_TABLE['cttsov2'];
  }

  throw new Error('No matching workflow name found!');
};

/**
 * Group equivalent workflow type as it is renamed
 * @param wfrName the wfr name
 * @returns
 */
const groupWfrName = (wfrName: string) => {
  if (['wts', 'dragen-wgts-rna'].includes(wfrName)) return 'dragen-wgts-rna';
  if (['dragen-tso500-ctDNA', 'cttsov2'].includes(wfrName)) return 'dragen-tso500-ctDNA';
  if (['tumor-normal', 'dragen-wgts-dna'].includes(wfrName)) return 'dragen-wgts-dna';
  return wfrName;
};

function CaseFileViewer({ externalEntitySet }: { externalEntitySet: Record<string, any>[] }) {
  // Filter only 'workflow_run' entities and build a map from orcabusId to their case details
  const wfrMapCase: Record<string, any> = {};
  externalEntitySet.forEach((o) => {
    if (o.externalEntity.serviceName == 'workflow' && o.externalEntity.type == 'workflow_run') {
      wfrMapCase[o.externalEntity.orcabusId] = { ...o };
    }
  });
  const {
    data: workflowRunsData,
    error,
    isError,
    isFetching,
  } = useWorkflowRunListModel({
    params: {
      query: {
        rowsPerPage: DEFAULT_NON_PAGINATE_PAGE_SIZE,
        orcabusId: Object.keys(wfrMapCase),
      },
    },
    reactQuery: {
      enabled: Object.keys(wfrMapCase).length > 0,
    },
  });
  const workflowRunsResults = workflowRunsData?.results;

  if (isError) {
    throw error;
  }
  if (isFetching) {
    return <SpinnerWithText text='Loading workflow run data ...' />;
  }

  const groupedWorkflowName: Record<string, { workflowName: string; portalRunId: string }[]> = {};
  if (!!workflowRunsResults && workflowRunsResults.length > 0) {
    for (const o of workflowRunsResults) {
      const wfrName = o.workflow.name;
      const mainWfrName = groupWfrName(wfrName);

      if (![...CTTSO_WORKFLOW, ...WGS_WORKFLOW, ...WTS_WORKFLOW].includes(wfrName)) {
        continue;
      }
      const newO = { workflowName: wfrName, portalRunId: o.portalRunId };

      const currentWftMapping = groupedWorkflowName[mainWfrName];
      groupedWorkflowName[mainWfrName] = currentWftMapping
        ? currentWftMapping.concat(newO)
        : [newO];
    }
  }
  return (
    <div>
      {Object.keys(groupedWorkflowName).length === 0 ? (
        <div className='py-8 text-center text-gray-500 dark:text-gray-400'>
          No file highlight preview available.
        </div>
      ) : (
        Object.keys(groupedWorkflowName).map((workflowName) => {
          const props = getFileViewerWorkflowProps(workflowName);
          return (
            <FileWorkflowViewer
              key={workflowName}
              workflowRuns={groupedWorkflowName[workflowName]}
              // eslint-disable-next-line react/prop-types
              keyPatterns={props.keyPatterns}
              // eslint-disable-next-line react/prop-types
              getTableDataFormat={props.getTableData}
            />
          );
        })
      )}
    </div>
  );
}

export default CaseFileViewer;
