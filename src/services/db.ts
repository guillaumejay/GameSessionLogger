import Dexie from 'dexie';
import type { Session } from '../models/Session';
import type { Event } from '../models/Event';

export class GameSessionDatabase extends Dexie {
  sessions!: Dexie.Table<Session, string>;
  events!: Dexie.Table<Event, string>;

  constructor() {
    super('GameSessionLoggerDB');

    this.version(1).stores({
      sessions: 'id, createdAt',
      events: 'id, [sessionId+timestamp]'
    });
  }
}

export const db = new GameSessionDatabase();
