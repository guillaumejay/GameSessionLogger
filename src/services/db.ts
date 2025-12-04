import Dexie from 'dexie';
import type { Session } from '../models/Session';
import type { Event } from '../models/Event';

export class GameSessionDatabase extends Dexie {
  sessions!: Dexie.Table<Session, string>;
  events!: Dexie.Table<Event, string>;

  constructor() {
    super('GameSessionLoggerDB');

    // Version 1: Original schema
    this.version(1).stores({
      sessions: 'id, createdAt',
      events: 'id, [sessionId+timestamp]'
    });

    // Version 2: Add session type support
    this.version(2).stores({
      sessions: 'id, type, createdAt',
      events: 'id, [sessionId+timestamp]'
    }).upgrade(async tx => {
      console.log('Migrating database to v2: adding session types');
      await tx.table('sessions').toCollection().modify(session => {
        if (!session.type) {
          session.type = 'RPG';  // Assign default type to existing sessions
          console.log(`Migrated session ${session.id} to RPG type`);
        }
      });
      console.log('Database migration to v2 complete');
    });

    // Version 3: Add event duration support (endTimestamp field)
    // No upgrade function needed - endTimestamp is optional, existing events will have undefined
    this.version(3).stores({
      sessions: 'id, type, createdAt',
      events: 'id, [sessionId+timestamp]'  // No index change needed for endTimestamp
    });
  }
}

export const db = new GameSessionDatabase();
