import Dexie, { type EntityTable } from 'dexie';
import type { Lot, Photo, OutboxEvent, PriceCache, RecyclerCache, SyncMetadata } from '../types';

class SahiRateDatabase extends Dexie {
  lots!: EntityTable<Lot, 'id'>;
  photos!: EntityTable<Photo, 'id'>;
  outbox!: EntityTable<OutboxEvent, 'id'>;
  price_cache!: EntityTable<PriceCache, 'material_id'>;
  recycler_cache!: EntityTable<RecyclerCache, 'recycler_id'>;
  sync_metadata!: EntityTable<SyncMetadata, 'key'>;

  constructor() {
    super('SahiRateDB');
    
    // Define schema
    // Note: Only fields we want to index need to be specified here.
    this.version(1).stores({
      lots: 'id, sync_status, created_at_local',
      photos: 'id, lot_id',
      outbox: 'id, sync_status, type, created_at_local',
      price_cache: 'material_id',
      recycler_cache: 'recycler_id',
      sync_metadata: 'key'
    });
  }
}

export const db = new SahiRateDatabase();
