import { components } from '@/api/types/metadata';
import { FC, Suspense } from 'react';
import { DetailedErrorBoundary } from '@/components/common/error';
import { useState } from 'react';
import { getTableColumn } from '@/modules/files/components/FileAPITable';
import { useSuspenseWorkflowRunListModel } from '@/api/workflow';
import { useQueryFileObject } from '@/api/file';
import { GroupedTable } from '@/components/tables';
import { Column, TableData } from '@/components/tables/GroupedRowTable';
import { Dropdown } from '@/components/common/dropdowns';
import { DEFAULT_NON_PAGINATE_PAGE_SIZE } from '@/utils/constant';
import { SpinnerWithText } from '@/components/common/spinner';
import { ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { Badge } from '@/components/common/badges';
import { Tooltip } from '@/components/common/tooltips';
import { JsonToTable } from '@/components/common/json-to-table';
import { WorkflowDialogDetail } from './WorkflowDialogDetail';

const WORKFLOW_ANALYSIS_TABLE = {
  sash: {
    keyPatterns: [
      '*.html',
      '*circos*.png',
      '*/smlv_somatic/filter/*.pass.vcf.gz',
      '*/smlv_germline/report/*annotations.vcf.gz',
    ],
    getTableData: (data: ({ key: string } & Record<string, unknown>)[]): TableData[] => {
      return [
        {
          groupTitle: 'LINX',
          groupData: data.filter((r) => r.key.endsWith('linx.html')),
        },
        {
          groupTitle: 'CANCER',
          groupData: data.filter((r) => r.key.endsWith('cancer_report.html')),
        },
        {
          groupTitle: 'PCGR',
          groupData: data.filter((r) => r.key.endsWith('pcgr.html')),
        },
        {
          groupTitle: 'CPSR',
          groupData: data.filter((r) => r.key.endsWith('cpsr.html')),
        },
        {
          groupTitle: 'MULTIQC',
          groupData: data.filter((r) => r.key.includes('multiqc')),
        },
        {
          groupTitle: 'CIRCOS',
          groupData: data.filter((r) => r.key.endsWith('.png')),
        },
        {
          groupTitle: 'VCF',
          groupData: data.filter((r) => r.key.endsWith('.vcf.gz')),
        },
      ];
    },
  },
  'tumor-normal': {
    keyPatterns: ['*.bam'],
    getTableData: (data: ({ key: string } & Record<string, unknown>)[]): TableData[] => {
      return [
        {
          groupTitle: 'BAM',
          groupData: data.filter((r) => r.key.endsWith('.bam')),
        },
      ];
    },
  },
  wts: {
    keyPatterns: ['*multiqc*.html', '*fusions*.pdf', '*.bam'],
    getTableData: (data: ({ key: string } & Record<string, unknown>)[]): TableData[] => {
      return [
        {
          groupTitle: 'MULTIQC',
          groupData: data.filter((r) => r.key.includes('multiqc')),
        },
        {
          groupTitle: 'FUSIONS',
          groupData: data.filter((r) => r.key.includes('fusions')),
        },
        {
          groupTitle: 'BAM',
          groupData: data.filter((r) => r.key.endsWith('.bam')),
        },
      ];
    },
  },
  rnasum: {
    keyPatterns: ['*RNAseq_report.html', '*/genes.expr.perc.html', '*/genes.expr.z.html'],
    getTableData: (data: ({ key: string } & Record<string, unknown>)[]): TableData[] => {
      return [
        {
          groupTitle: 'HTML',
          groupData: data.filter((r) => r.key.endsWith('.html')),
        },
      ];
    },
  },
  cttsov2: {
    keyPatterns: [
      '*.bam',
      '*.tmb.msaf.csv',
      '*/Results/*/*.csv',
      '*/Results/*/*.tsv',
      '*/Results/*.vcf.gz',
      '*/Results/*.gvcf.gz',
      '*/Results/*microsat_output.json',
    ],
    getTableData: (data: ({ key: string } & Record<string, unknown>)[]): TableData[] => {
      return [
        {
          groupTitle: 'CSV',
          groupData: data.filter((r) => r.key.endsWith('.csv')),
        },
        {
          groupTitle: 'TSV',
          groupData: data.filter((r) => r.key.endsWith('.tsv')),
        },
        {
          groupTitle: 'JSON',
          groupData: data.filter((r) => r.key.endsWith('.json')),
        },
        {
          groupTitle: 'VCF',
          groupData: data.filter((r) => r.key.endsWith('.vcf.gz')),
        },
        {
          groupTitle: 'BAM',
          groupData: data.filter((r) => r.key.endsWith('.bam')),
        },
      ];
    },
  },
};

type LibraryAnalysisReportTableProps = { libraryDetail: components['schemas']['LibraryDetail'] };

export const LibraryAnalysisReportTable: FC<LibraryAnalysisReportTableProps> = ({
  libraryDetail,
}) => {
  /**
   * FIX ME
   *
   * This temporarily show the expected reports from each library type (as existing data-portal)
   * Ideally this could be viewable in a case-view to show relevant reports
   *
   * Notes:
   * WGS library type => "UMCCRISE" && ("tumor-normal" or "dragen-wgts-dna" workflow type html reports
   * WTS library type => ("wts" or "dragen-wgts-rna") && "rnasum" workflow type pdf/html reports
   * ctDNA library type && "ctTSO" assay => "dragen-tso500-ctDNA" or "cttsov2" workflow pdf/html reports
   */

  const libraryDisplayNotes = {
    '"WGS" type': ['sash', 'tumor-normal or dragen-wgts-dna'],
    '"WTS" type': ['wts or dragen-wgts-rna', 'rnasum'],
    '"ctDNA" type, "ctTSO" assay': ['dragen-tso500-ctDNA or cttsov2'],
  };

  return (
    <Suspense fallback={<SpinnerWithText text='loading data ...' />}>
      <div className='mb-3 flex flex-row items-center py-3'>
        <div className='text-lg font-bold'>Overview Highlights</div>
        <Tooltip
          text={
            <div>
              <h1 className='font-bold'>What runs to expect here?</h1>
              <JsonToTable data={libraryDisplayNotes} className='shadow-none' />
            </div>
          }
          position='bottom'
          background='light'
          size='large'
          className='w-96 dark:bg-gray-800 dark:text-gray-400'
        >
          <InformationCircleIcon className='2-5 mx-2 h-5' />
        </Tooltip>
      </div>
      <div key={libraryDetail.orcabusId}>
        {libraryDetail.type === 'WGS' ? (
          <>
            <DetailedErrorBoundary errorTitle={`Unable to load 'sash' report files`}>
              <Suspense fallback={<SpinnerWithText text='loading data ...' />}>
                <AnalysisTable
                  libraryOrcabusId={libraryDetail.orcabusId}
                  workflowType='sash'
                  keyPatterns={WORKFLOW_ANALYSIS_TABLE['sash']['keyPatterns']}
                  getTableDataFormat={WORKFLOW_ANALYSIS_TABLE['sash']['getTableData']}
                />
              </Suspense>
            </DetailedErrorBoundary>
            <div className='py-4'></div>
            <DetailedErrorBoundary
              errorTitle={`Unable to load 'tumor-normal' or 'dragen-wgts-dna' report files`}
            >
              <Suspense fallback={<SpinnerWithText text='loading data ...' />}>
                <AnalysisTable
                  libraryOrcabusId={libraryDetail.orcabusId}
                  workflowType={['tumor-normal', 'dragen-wgts-dna']}
                  keyPatterns={WORKFLOW_ANALYSIS_TABLE['tumor-normal']['keyPatterns']}
                  getTableDataFormat={WORKFLOW_ANALYSIS_TABLE['tumor-normal']['getTableData']}
                />
              </Suspense>
            </DetailedErrorBoundary>
          </>
        ) : libraryDetail.type === 'WTS' ? (
          <>
            <DetailedErrorBoundary
              errorTitle={`Unable to load 'wts' or 'dragen-wgts-rna' report files`}
            >
              <Suspense fallback={<SpinnerWithText text='loading data ...' />}>
                <AnalysisTable
                  libraryOrcabusId={libraryDetail.orcabusId}
                  workflowType={['wts', 'dragen-wgts-rna']}
                  keyPatterns={WORKFLOW_ANALYSIS_TABLE['wts']['keyPatterns']}
                  getTableDataFormat={WORKFLOW_ANALYSIS_TABLE['wts']['getTableData']}
                />
              </Suspense>
            </DetailedErrorBoundary>
            <div className='py-4'></div>
            <DetailedErrorBoundary errorTitle={`Unable to load 'rnasum' report files`}>
              <Suspense fallback={<SpinnerWithText text='loading data ...' />}>
                <AnalysisTable
                  libraryOrcabusId={libraryDetail.orcabusId}
                  workflowType='rnasum'
                  keyPatterns={WORKFLOW_ANALYSIS_TABLE['rnasum']['keyPatterns']}
                  getTableDataFormat={WORKFLOW_ANALYSIS_TABLE['rnasum']['getTableData']}
                />
              </Suspense>
            </DetailedErrorBoundary>
          </>
        ) : libraryDetail.type === 'ctDNA' &&
          (libraryDetail.assay?.toLowerCase() === 'cttso' ||
            libraryDetail.assay?.toLowerCase() == 'cttsov2') ? (
          <DetailedErrorBoundary
            errorTitle={`Unable to load 'dragen-tso500-ctdna' or 'cttsov2' report files`}
          >
            <Suspense fallback={<SpinnerWithText text='loading data ...' />}>
              <AnalysisTable
                libraryOrcabusId={libraryDetail.orcabusId}
                workflowType={['cttsov2', 'dragen-tso500-ctdna']}
                keyPatterns={WORKFLOW_ANALYSIS_TABLE['cttsov2']['keyPatterns']}
                getTableDataFormat={WORKFLOW_ANALYSIS_TABLE['cttsov2']['getTableData']}
              />
            </Suspense>
          </DetailedErrorBoundary>
        ) : (
          <pre>No file highlights available for this library</pre>
        )}
      </div>
    </Suspense>
  );
};

export const AnalysisTable = ({
  libraryOrcabusId,
  workflowType,
  keyPatterns,
  getTableDataFormat,
}: {
  libraryOrcabusId: string;
  workflowType: string | string[];
  keyPatterns: string[];
  getTableDataFormat: (data: ({ key: string } & Record<string, unknown>)[]) => TableData[];
}) => {
  // Only shows successful workflow runs
  const workflowRun = useSuspenseWorkflowRunListModel({
    params: {
      query: {
        libraries__orcabusId: libraryOrcabusId,
        workflow__name: workflowType,
        ordering: '-portalRunId',
        rowsPerPage: DEFAULT_NON_PAGINATE_PAGE_SIZE,
        status: 'SUCCEEDED',
      },
    },
  }).data;

  const workflowRunResults = workflowRun?.results;
  if (!workflowRunResults || workflowRunResults.length <= 0) {
    throw new Error(`No '${workflowType}' run found!`);
  }

  const [selectedWorkflowRun, setSelectedWorkflowRun] = useState(workflowRunResults[0]);

  const fileQueryResult = useQueryFileObject({
    params: {
      query: {
        'key[]': keyPatterns,
        rowsPerPage: DEFAULT_NON_PAGINATE_PAGE_SIZE,
        currentState: true,
        'attributes[portalRunId]': selectedWorkflowRun.portalRunId,
      },
    },
  });

  if (fileQueryResult.isFetching) {
    return <SpinnerWithText text='Loading data ...' />;
  }

  const fileQueryData = fileQueryResult.data;
  const isDataPaginated = !!fileQueryData && fileQueryData.links.next !== null;
  if (!fileQueryData?.results) {
    throw new Error('No report found!');
  }

  const tableData = fileQueryData.results.map((item) => ({
    key: item.key,
    lastModifiedDate: item.lastModifiedDate,
    size: item.size,
    fileRecord: item,
  }));

  const isMultipleRuns = workflowRunResults.length > 1;
  const currentSelectedWorkflowDetail = workflowRunResults.find(
    (w) => w.portalRunId === selectedWorkflowRun.portalRunId
  );
  if (!currentSelectedWorkflowDetail) {
    throw new Error('No workflow detail found!');
  }

  return (
    <>
      <GroupedTable
        tableHeader={
          <div className='flex flex-col space-y-2'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center'>
                <div className='text-gray-900 dark:text-gray-100'>
                  {selectedWorkflowRun.workflow.name}
                </div>

                <WorkflowDialogDetail
                  portalRunId={selectedWorkflowRun.portalRunId}
                  workflowDetail={currentSelectedWorkflowDetail}
                />
                <div className='flex h-full items-center text-sm font-normal text-gray-500 dark:text-gray-400'>
                  <Tooltip
                    text={`This page will only show 'SUCCEEDED' workflow runs.`}
                    position='right'
                    background='light'
                    size='small'
                    className='z-50 w-96 text-wrap whitespace-normal'
                  >
                    <InformationCircleIcon className='ml-2 h-5 w-5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200' />
                  </Tooltip>
                </div>
              </div>
              {isMultipleRuns && (
                <div className='flex items-center space-x-3'>
                  <Badge
                    type='warning'
                    className='inline-flex items-center py-2 text-sm font-medium whitespace-nowrap'
                  >
                    <ExclamationTriangleIcon className='mr-2 h-5 w-5' />
                    <span>Multiple Runs</span>
                  </Badge>
                  <Dropdown
                    floatingLabel='Portal Run ID'
                    value={selectedWorkflowRun.portalRunId}
                    items={workflowRunResults.map((i) => ({
                      label: i.portalRunId,
                      onClick: () => setSelectedWorkflowRun(i),
                    }))}
                    className='min-w-[200px] dark:bg-gray-800 dark:text-gray-200'
                  />
                </div>
              )}
            </div>
            {isDataPaginated && (
              <div className='text-xs text-gray-500 italic dark:text-gray-400'>
                * Due to pagination, some files may not be shown here.
              </div>
            )}
          </div>
        }
        striped={false}
        columns={getTableColumn({ isHideKeyPrefix: true }) as Column[]}
        tableData={getTableDataFormat(tableData)}
      />
    </>
  );
};
