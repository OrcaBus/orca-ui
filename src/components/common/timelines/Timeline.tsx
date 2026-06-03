/* eslint-disable react-refresh/only-export-components */
// https://github.com/ArnaudBarre/eslint-plugin-react-refresh/issues/25#issuecomment-1729071347

import { FC, useState, ReactNode } from 'react';
import { classNames } from '@/utils/commonUtils';
import {
  ChatBubbleBottomCenterTextIcon,
  CheckCircleIcon,
  EllipsisHorizontalIcon,
  DocumentTextIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { dayjs } from '@/utils/dayjs';
import { Badge } from '../badges';
import { IconDropdown } from '@/components/common/dropdowns';
import type { DropdownItemProps } from '@/components/common/dropdowns/IconDropdown';

export enum TimelineEventTypes {
  STATE_CHANGE = 'stateChange',
  COMMENT = 'comment',
  SAMPLE_SHEET_UPLOAD = 'sampleSheetUpload',
  FAILED_ACTION = 'failedAction',
}

export interface TimelineEvent {
  id: string;
  content?: ReactNode;
  comment?: string;
  status?: string;
  datetime: string;
  iconBackground?: string;
  payloadId?: string;
  eventType?: TimelineEventTypes;
  title?: string;
  subtitle?: string;
  tags?: string[];
  user?: {
    name: string;
    avatar?: string;
  };
  actionsList?: DropdownItemProps[];
}

export interface TimelineProps {
  timelineEvents: TimelineEvent[];
  handldEventClick?: (event: TimelineEvent) => void;
  selectId?: string;
  isCollapsed?: boolean;
}

const Timeline: FC<TimelineProps> = ({
  timelineEvents,
  handldEventClick = undefined,
  selectId = '',
  isCollapsed = false,
}) => {
  const [localSelectedEventId, setLocalSelectedEventId] = useState<string>(
    timelineEvents[0]?.id || ''
  );
  const selectedEventId = selectId || localSelectedEventId;

  const eventIcon = (eventType: TimelineEvent['eventType'] | undefined) => {
    if (eventType === TimelineEventTypes.COMMENT) {
      return (
        <ChatBubbleBottomCenterTextIcon aria-hidden='true' className='h-5 w-5 text-gray-500' />
      );
    }
    if (eventType === TimelineEventTypes.SAMPLE_SHEET_UPLOAD) {
      return <DocumentTextIcon aria-hidden='true' className='h-5 w-5 text-green-500' />;
    }
    if (eventType === TimelineEventTypes.FAILED_ACTION) {
      return <ExclamationCircleIcon aria-hidden='true' className='h-5 w-5 text-red-500' />;
    }
    return <CheckCircleIcon aria-hidden='true' className='h-5 w-5 text-green-500' />;
  };

  const handleTimelineEventClick = (event: TimelineEvent) => {
    setLocalSelectedEventId(event.id || '');
    if (handldEventClick) {
      handldEventClick(event);
    }
  };

  return (
    <div className='flow-root'>
      <ul role='list' className='-mb-8'>
        {timelineEvents.map((event, eventIdx) => (
          <li key={eventIdx}>
            <div className='relative pb-8'>
              {eventIdx !== timelineEvents.length - 1 ? (
                <span
                  aria-hidden='true'
                  className='absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-700'
                />
              ) : null}

              <div
                className={classNames(
                  'items-top relative flex space-x-4',
                  'rounded-lg p-0 transition-all duration-200'
                )}
              >
                {/* Icon Container */}
                <div>
                  <div
                    className={classNames(
                      'flex h-8 w-8 cursor-pointer items-center justify-center rounded-full',
                      event.iconBackground || 'bg-gray-100 dark:bg-gray-700',
                      'ring-8 ring-white dark:ring-gray-900',
                      'transition-all duration-300 ease-in-out',
                      selectedEventId === event.id
                        ? [
                            'scale-110',
                            'ring-blue-50 dark:ring-blue-900/20',
                            'shadow-lg shadow-blue-100/50 dark:shadow-blue-900/20',
                            'bg-blue-100 dark:bg-blue-900/30',
                          ]
                        : 'hover:scale-105'
                    )}
                    onClick={() => handleTimelineEventClick(event)}
                  >
                    {event.eventType ? (
                      eventIcon(event.eventType)
                    ) : (
                      <CheckCircleIcon
                        aria-hidden='true'
                        className={classNames(
                          'h-5 w-5',
                          selectedEventId === event.id
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-green-500 dark:text-green-400'
                        )}
                      />
                    )}
                  </div>
                </div>
                {/* Event Content Section */}
                <div
                  className={classNames(
                    'flex h-full min-w-0 flex-1 flex-col pt-1',
                    'rounded-lg transition-all duration-300 ease-in-out',
                    selectedEventId === event.id && [
                      'bg-linear-to-r from-blue-50/80 to-white dark:from-blue-900/20 dark:to-gray-800/50',
                      'shadow-xs shadow-blue-100/50 dark:shadow-blue-900/20',
                      'ring-1 ring-blue-100/50 dark:ring-blue-900/20',
                      '-mt-1 p-3 pl-4',
                      'transform-gpu',
                      'cursor-pointer',
                    ],
                    !selectedEventId && 'hover:bg-gray-50/50 dark:hover:bg-gray-800/20'
                  )}
                  onClick={(e) => {
                    // Prevent event selection if clicking on the action button
                    if (!(e.target as HTMLElement).closest('.action-dropdown')) {
                      handleTimelineEventClick(event);
                    }
                  }}
                >
                  {/* Header Section */}
                  <div
                    className={classNames(
                      'flex',
                      isCollapsed
                        ? 'flex-col space-y-1' // Stacked layout when collapsed
                        : 'items-center justify-between space-x-4' // Regular horizontal layout
                    )}
                  >
                    <div
                      className={classNames(
                        'flex',
                        isCollapsed
                          ? 'flex-col space-y-1' // Stacked layout when collapsed
                          : 'items-center space-x-4' // Regular horizontal layout
                      )}
                    >
                      {/* User Avatar & Info Section */}
                      <div
                        className={classNames(
                          'flex items-center',
                          isCollapsed ? 'w-full' : 'space-x-2'
                        )}
                      >
                        {event.user?.avatar && (
                          <img
                            src={event.user.avatar}
                            alt={event.user.name}
                            className={classNames(
                              'rounded-full',
                              isCollapsed ? 'mr-2 h-5 w-5' : 'h-6 w-6' // Smaller avatar when collapsed
                            )}
                          />
                        )}

                        {/* Title, User, Time Info */}
                        <div
                          className={classNames(
                            'flex min-w-0',
                            isCollapsed ? 'flex-col space-y-0.5' : 'items-center gap-1'
                          )}
                        >
                          {/* First Row: Title (when collapsed) */}
                          {isCollapsed && (
                            <div className='flex flex-row items-center justify-between'>
                              {event.title && (
                                <span className='truncate text-sm font-medium text-gray-900 dark:text-gray-100'>
                                  {event.title}
                                </span>
                              )}
                              {event.actionsList && event.actionsList.length > 0 && (
                                <div
                                  className='action-dropdown ml-2 flex items-center'
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <IconDropdown
                                    BtnIcon={EllipsisHorizontalIcon}
                                    items={event.actionsList || []}
                                    type='square'
                                    className='ml-2 text-gray-500'
                                    menuClassName='w-40'
                                  />
                                </div>
                              )}
                            </div>
                          )}

                          {/* User & Time Info */}
                          <div className='flex min-w-0 items-center gap-1'>
                            {/* Title (when not collapsed) */}
                            {!isCollapsed && event.title && (
                              <>
                                <span className='truncate text-sm font-medium text-gray-900 dark:text-gray-100'>
                                  {event.title}
                                </span>
                                <span className='text-gray-400 dark:text-gray-500'>•</span>
                              </>
                            )}

                            {/* User Name */}
                            {event.user?.name && (
                              <>
                                <span className='truncate text-sm text-gray-600 dark:text-gray-300'>
                                  {event.user.name}
                                </span>
                                <span className='text-gray-400 dark:text-gray-500'>•</span>
                              </>
                            )}

                            {/* Timestamp */}
                            <time
                              dateTime={event.datetime}
                              className={classNames(
                                'text-sm text-gray-500 dark:text-gray-400',
                                isCollapsed ? 'text-xs' : 'whitespace-nowrap'
                              )}
                            >
                              {isCollapsed
                                ? dayjs(event.datetime).format('DD/MM/YYYY HH:mm') // Shorter format when collapsed
                                : dayjs(event.datetime).format('MMM DD, YYYY hh:mm A')}
                            </time>
                          </div>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div
                        className={classNames('flex items-center', isCollapsed ? 'mt-1' : 'ml-2')}
                      >
                        {event.status && (
                          <Badge
                            status={event.status}
                            className={classNames('text-xs', isCollapsed ? 'justify-center' : '')}
                          >
                            {event.status}
                          </Badge>
                        )}
                      </div>
                    </div>
                    {/* Actions Dropdown */}
                    {!isCollapsed && event.actionsList && event.actionsList.length > 0 && (
                      <div className='action-dropdown ml-2' onClick={(e) => e.stopPropagation()}>
                        <IconDropdown
                          BtnIcon={EllipsisHorizontalIcon}
                          items={event.actionsList || []}
                          type='square'
                          className='ml-2 text-gray-500'
                          menuClassName='w-40'
                        />
                      </div>
                    )}
                  </div>

                  {/* Content Section */}
                  {event.content && (
                    <div className='mt-2 space-y-3'>
                      <div className='text-sm text-gray-700 dark:text-gray-300'>
                        {event.content}
                      </div>

                      {/* Tags */}
                      {event.tags && event.tags.length > 0 && (
                        <div className='flex flex-wrap gap-2'>
                          {event.tags.map((tag, index) => (
                            <span
                              key={index}
                              className='inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Comment Section */}
                  {event.comment && (
                    <div className='mt-2 rounded-md bg-gray-50 p-3 ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700'>
                      <pre
                        className={classNames(
                          'text-sm text-gray-600 dark:text-gray-300',
                          'break-all whitespace-pre-wrap', // Preserves formatting while allowing wrapping
                          'font-sans' // Keep the regular font instead of monospace
                        )}
                      >
                        {event.comment}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Timeline;
