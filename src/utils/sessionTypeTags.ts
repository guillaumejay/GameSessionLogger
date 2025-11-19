import type { SessionType } from '../models/SessionType';
import type { EventTag } from '../models/Event';
import { RPG_TAGS, BOARDGAME_TAGS } from '../models/Event';

type TagsByType = Record<SessionType, readonly EventTag[]>;

export const SESSION_TYPE_TAGS: TagsByType = {
  RPG: RPG_TAGS,
  Boardgame: BOARDGAME_TAGS,
} as const;

export function getTagsForSessionType(type: SessionType): readonly EventTag[] {
  return SESSION_TYPE_TAGS[type];
}
