import {
  CircleStackIcon,
  FolderIcon,
  ShieldCheckIcon,
  InboxStackIcon,
  DocumentDuplicateIcon,
} from '@heroicons/react/24/outline';
import {
  CircleStackIcon as SolidCircleStackIcon,
  FolderIcon as SolidFolderIcon,
  ShieldCheckIcon as SolidShieldCheckIcon,
  InboxStackIcon as SolidInboxStackIcon,
  DocumentDuplicateIcon as SolidDocumentDuplicateIcon,
} from '@heroicons/react/24/solid';
import { AppURLs } from './appURLs';
import { SequenceIcon } from '@/components/icons/SequenceIcon';
import { SolidSequenceIcon } from '@/components/icons/SolidSequenceIcon';
// import { AnalysisIcon } from '@/components/icons/AnalysisIcon';
import { WorkflowIcon } from '@/components/icons/WorkflowIcon';
import { SolidWorkflowIcon } from '@/components/icons/SolidWorkflowIcon';
// import { ReportIcon } from '@/components/icons/ReportIcon';

const sideNavigation = [
  {
    name: 'Case',
    icon: DocumentDuplicateIcon,
    solidIcon: SolidDocumentDuplicateIcon,
    href: AppURLs.Case,
  },
  { name: 'Lab', icon: CircleStackIcon, solidIcon: SolidCircleStackIcon, href: AppURLs.Lab },
  // { name: 'Runs', icon: ChartBarIcon, solidIcon: SolidChartBarIcon, href: AppURLs.Runs },
  { name: 'Sequence', icon: SequenceIcon, solidIcon: SolidSequenceIcon, href: AppURLs.Sequence },
  { name: 'Workflows', icon: WorkflowIcon, solidIcon: SolidWorkflowIcon, href: AppURLs.Workflows },

  { name: 'Files', icon: FolderIcon, solidIcon: SolidFolderIcon, href: AppURLs.Files },
  {
    name: 'SSCheck',
    icon: ShieldCheckIcon,
    solidIcon: SolidShieldCheckIcon,
    href: AppURLs.Sscheck,
  },
  { name: 'Vault', icon: InboxStackIcon, solidIcon: SolidInboxStackIcon, href: AppURLs.OrcaVault },
];

const libraryModuleNavigation = [
  {
    title: 'Library',
    children: [
      { name: 'Overview', href: '/lab/library/overview' },
      { name: 'File View', href: '/lab/library/fileview' },
    ],
  },
  {
    title: 'Reports',
    children: [
      { name: 'WGS', href: '/lab/library/reports/wgs' },
      { name: 'WTS', href: '/lab/library/reports/wts' },
      { name: 'TSO500', href: '/lab/library/reports/tso500' },
      { name: 'TSO500 (V2)', href: '/lab/library/reports/tso500v2' },
      { name: 'WGS (bcbio)', href: '/lab/library/reports/wgsbcbio' },
      { name: 'WTS (bcbio)', href: '/lab/library/reports/wtsbcbio' },
      { name: 'WGS (sash)', href: '/lab/library/reports/wgssash' },
    ],
  },
];

// const runsModuleNavigation = [
//   {
//     title: 'Runs',
//     children: [
//       { name: 'Sequence', href: AppURLs.RunsSequence, icon: SequenceIcon },
//       // umcomment when analysis is ready
//       // { name: 'Analysis', href: AppURLs.RunsAnalysis, icon: AnalysisIcon },
//       { name: 'Workflow', href: AppURLs.RunsWorkflow, icon: WorkflowIcon },
//     ],
//   },
// ];

export default sideNavigation;
export { libraryModuleNavigation };
