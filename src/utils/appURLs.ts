export enum AppURLs {
  // auth
  SignIn = '/signIn',

  // Case
  Case = '/case',

  // Lab
  Lab = '/lab',
  LabLibraryOverview = '/lab/library/:id/overview',
  LabLibraryFileView = '/lab/library/:id/fileview',
  LabLibraryReportsWgs = '/lab/library/:id/reports/wgs',
  LabLibraryReportsWts = '/lab/library/:id/reports/wts',
  LabLibraryReportsTso500 = '/lab/library/:id/reports/tso500',
  LabLibraryReportsTso500v2 = '/lab/library/:id/reports/tso500v2',
  LabLibraryReportsWgsbcbio = '/lab/library/:id/reports/wgsbcbio',
  LabLibraryReportsWtsbcbio = '/lab/library/:id/reports/wtsbcbio',
  LabLibraryReportsWgssash = '/lab/library/:id/reports/wgssash',

  // Runs
  Runs = '/runs',
  // Runs Sequence
  RunsSequence = '/runs/sequence',
  RunsSequenceDeatils = '/runs/sequence/:id',
  RunsSequenceDeatilsTable = '/runs/sequence/:id/table',
  RunsSequenceDeatilsDiagram = '/runs/sequence/:id/diagram',
  RunsSequenceDeatilsReport = '/runs/sequence/:id/report',
  // Runs Analysis
  RunsAnalysis = '/runs/analysis',
  RunsAnalysisDeatils = '/runs/analysis/:id',
  RunsAnalysisDeatilsTable = '/runs/analysis/:id/table',
  RunsAnalysisDeatilsDiagram = '/runs/analysis/:id/diagram',
  RunsAnalysisDeatilsReport = '/runs/analysis/:id/report',
  // Runs Library
  RunsLibrary = '/runs/library',
  // Runs Workflow
  RunsWorkflow = '/runs/workflow',

  // Files
  Files = '/files',

  // sscheck
  Sscheck = '/sscheck',

  // 404
  NotFound = '/404',

  // OrcaVault (Data Warehouse)
  OrcaVault = '/vault',
}
