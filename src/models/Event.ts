export const RPG_TAGS = ['Combat', 'Roleplay', 'Downtime', 'Scoring', 'Meal', 'Other'] as const;
export const BOARDGAME_TAGS = ['Setup', 'Turn', 'Round', 'Scoring', 'Teardown', 'Other'] as const;

// Union of all possible tags across all session types
export const EVENT_TAGS = [...RPG_TAGS, ...BOARDGAME_TAGS] as const;
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
