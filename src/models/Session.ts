import type { SessionType } from './SessionType';

export interface Session {
  id: string;
  name: string;
  type: SessionType;
  createdAt: string;  // ISO 8601
  updatedAt: string;  // ISO 8601
}

export function validateSessionName(name: string): string | null {
  const trimmed = name.trim();
  if (trimmed.length === 0) return 'Session name cannot be empty';
  if (trimmed.length > 100) return 'Session name must be 100 characters or less';
  return null;
}
