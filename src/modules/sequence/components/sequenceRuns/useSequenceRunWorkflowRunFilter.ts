import { useMemo } from 'react';
import { dayjs } from '@/utils/dayjs';
import { useSequenceRunContext } from './SequenceRunContext';

/**
 * Derives the workflow run query filter for the current sequence run:
 * the libraries of the latest sequence run, and a two day window starting
 * from the earliest sequence run end time.
 *
 * Shared by the stats and the table so both query an identical window, which
 * keeps their results consistent and lets them share the same query cache entry.
 *
 * Every value here is a pure function of `sequenceRunDetail` - never of the
 * current clock - so the query key stays stable across renders.
 */
export const useSequenceRunWorkflowRunFilter = () => {
  const { sequenceRunDetail } = useSequenceRunContext();

  return useMemo(() => {
    // copy before sorting: `sequenceRunDetail` is query cache data and sort() mutates in place
    const runsByEndTimeAsc = [...(sequenceRunDetail ?? [])].sort((a, b) =>
      dayjs(a.endTime).diff(dayjs(b.endTime))
    );

    // time range (first run end time to 2 days after)
    const start_time = runsByEndTimeAsc[0]?.endTime ?? undefined;

    return {
      // latest run library ids
      libraryIds: runsByEndTimeAsc[runsByEndTimeAsc.length - 1]?.libraries,
      start_time,
      end_time: start_time ? dayjs(start_time).add(2, 'days').toISOString() : undefined,
    };
  }, [sequenceRunDetail]);
};
