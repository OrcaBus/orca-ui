import dayjs from 'dayjs';
import dayjsUtc from 'dayjs/plugin/utc';
// import dayjsWeekday from 'dayjs/plugin/weekday';
// import isToday from 'dayjs/plugin/isToday';
// import timezone from 'dayjs/plugin/timezone';
// import relativeTime from 'dayjs/plugin/relativeTime';
import localizedFormat from 'dayjs/plugin/localizedFormat';

export const TIMESTAMP_FORMAT = 'YYYY-MM-DD HH:mm Z'; // e.g. "2025-08-11 17:44:30 +10:00"
export const DATE_FORMAT = 'YYYY-MM-DD';

dayjs.extend(dayjsUtc);
dayjs.extend(localizedFormat);
// dayjs.extend(dayjsWeekday);
// dayjs.extend(isToday);
// dayjs.extend(timezone);
// dayjs.extend(relativeTime);

// dayjs.tz.setDefault('Australia/Melbourne');

export { dayjs };
