import { WorkflowDiagram } from '@/components/diagrams';
import { mockStatusData } from '@/stories/_mock/mockWorkflowStatusData';

export default function WorkflowsPage() {
  return (
    <div className='h-[800px] w-[1200px]'>
      <WorkflowDiagram pipelineType='overview' statusData={mockStatusData} />
    </div>
  );
}
