import { mockWorkflowData } from './mockWorkflowData';
import { dayjs } from '../../utils/dayjs';

// group by portal run id for each workflow task to this format,
// start, end, and end status should be same as portal_run_id is same

//    [ {
//         startDate: start date;
//         endDate: end date;
//         taskName: use portal run Id string;
//         LibraryIds: [], // library ids collections
//         endStatus
//     }
//    ]

// portal_run_id using the each task portal_run_id
// interface TaskInput {
//     end_status: string;
//     durationMin: number;
//     SubjectID: string;
//     LibraryID: string;
//     SampleID: string;
//     Phenotype: string;
//     ExternalSubjectID: number;
//     ProjectOwner: string;
//     ProjectName: string;
//     Type: string;
//     Assay: string;
//     Source: string;
//     Workflow: string;
//     portal_run_id: string;
//     wfr_id: string;
//     start: string;
//     end: string;
//     s3_outdir_sash: string;
//   }

interface TaskOutput {
  startDate: Date;
  endDate: Date;
  taskName: string;
  libraryIds: string[];
  endStatus: string;
  subjectId: string;
}

const extractAnchorText = (htmlString: string): string => {
  const anchorTextMatch = htmlString.match(/>(.*?)<\/a>/);
  return anchorTextMatch ? anchorTextMatch[1] : '';
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const groupTasksByPortalRunId = (tasks: any[]) => {
  const groupedTasks: { [key: string]: TaskOutput } = {};

  tasks.forEach((task) => {
    const { portal_run_id, start, end, LibraryID, end_status, SubjectID } = task;

    if (!groupedTasks[portal_run_id]) {
      groupedTasks[portal_run_id] = {
        startDate: dayjs(start).toDate(),
        endDate: dayjs(end).toDate(),
        taskName: portal_run_id,
        libraryIds: [LibraryID],
        endStatus: end_status,
        subjectId: extractAnchorText(SubjectID), // "<a href=https://portal.umccr.org/subjects/SBJ05549/overview style='background-color:#E41A1C'>SBJ05549</a>" remove the a link
      };
    } else {
      groupedTasks[portal_run_id].libraryIds.push(LibraryID);
    }
  });

  return Object.values(groupedTasks);
};

//change the each data to groupTasksByPortalRunId
//return the object {
//    [taskName]: startDate: string;
//   endDate: string;
//   taskName: string;
//   LibraryIds: string[];
//   endStatus: string;
// }

interface TaskInput {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

interface TaskRunData {
  [taskName: string]: TaskOutput[];
}

export const generateMockWorkflowRunData = () => {
  const tasksData: { [key: string]: TaskInput[] } = { ...mockWorkflowData };
  Object.keys(tasksData).forEach((key) => {
    tasksData[key] = groupTasksByPortalRunId(tasksData[key]);
  });
  return tasksData as TaskRunData;
};

// Assuming the file exports mockData array

interface WorkflowCount {
  [workflow: string]: number;
}

interface SubjectWorkflowCount {
  [subjectId: string]: WorkflowCount;
}

export function groupBySubjectAndCount(): SubjectWorkflowCount {
  const result: SubjectWorkflowCount = {};

  Object.keys(mockWorkflowData).forEach((workflowType) => {
    mockWorkflowData[workflowType].forEach((item) => {
      const subjectID = extractAnchorText(item.SubjectID);

      if (!result[subjectID]) {
        result[subjectID] = {};
      }

      if (!result[subjectID][workflowType]) {
        result[subjectID][workflowType] = 0;
      }

      result[subjectID][workflowType] += 1;
    });
  });
  console.log(result);
  return result;
}
