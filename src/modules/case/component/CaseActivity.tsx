import { Timeline, TimelineEvent, TimelineEventTypes } from '@/components/common/timelines';
import { useQueryCaseActivityObject } from '@/api/case';

const CaseActivityTable = ({ caseOrcabusId }: { caseOrcabusId: string }) => {
  const caseTimeline = useQueryCaseActivityObject({
    params: { path: { orcabusId: caseOrcabusId } },
  });

  const results = caseTimeline.data?.results ?? [];

  const timelineEvents: TimelineEvent[] = results.map((entry, idx) => ({
    id: String(idx),
    datetime: entry.timestamp,
    title: entry.description,
    subtitle: entry.modelType,
    user: entry.actor ? { name: entry.actor } : undefined,
    tags: [entry.eventType],
    eventType:
      entry.eventType === 'comment' ? TimelineEventTypes.COMMENT : TimelineEventTypes.STATE_CHANGE,
  }));

  return <Timeline timelineEvents={timelineEvents} />;
};

export default CaseActivityTable;
