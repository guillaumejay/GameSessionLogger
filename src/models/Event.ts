export const EVENT_TAGS = ['Combat', 'Roleplay', 'Downtime', 'Scoring', 'Meal', 'Other'] as const;
export type EventTag = typeof EVENT_TAGS[number];

export interface Event {
  id: string;
  sessionId: string;
  tag: EventTag;
  timestamp: string;  // ISO 8601
  description: string;
}

export function isValidEventTag(tag: string): tag is EventTag {
  return EVENT_TAGS.includes(tag as EventTag);
}

export function validateEventDescription(description: string): string | null {
  if (description.length > 500) return 'Description must be 500 characters or less';
  return null;
}
