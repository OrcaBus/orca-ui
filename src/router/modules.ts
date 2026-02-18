import * as Sequence from '@/modules/sequence/routes';
import * as Workflows from '@/modules/workflows/routes';
import * as Lab from '@/modules/lab/routes';
import * as Files from '@/modules/files/routes';
import * as SSCheck from '@/modules/sscheck/routes';
import * as Warehouse from '@/modules/orcavault/routes';
import * as Case from '@/modules/case/routes';

const modulesRouters = [
  Lab.Router,
  Sequence.Router,
  Workflows.Router,
  Files.Router,
  SSCheck.Router,
  Warehouse.Router,
  Case.Router,
];

export default modulesRouters;
