export const SESSION_TYPES = ['RPG', 'Boardgame'] as const;
export type SessionType = typeof SESSION_TYPES[number];

export function isValidSessionType(value: unknown): value is SessionType {
  return typeof value === 'string' && SESSION_TYPES.includes(value as SessionType);
}

export function normalizeSessionType(value: unknown): SessionType {
  return isValidSessionType(value) ? value : 'RPG';
}
