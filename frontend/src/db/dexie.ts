import Dexie, { type EntityTable } from 'dexie';
import type { Lot, Photo, OutboxEvent, PriceCache, RecyclerCache, SyncMetadata, Handover, Payment } from '../types';

class SahiRateDatabase extends Dexie {
  lots!: EntityTable<Lot, 'id'>;
  photos!: EntityTable<Photo, 'id'>;
  outbox!: EntityTable<OutboxEvent, 'id'>;
  price_cache!: EntityTable<PriceCache, 'material_id'>;
  recycler_cache!: EntityTable<RecyclerCache, 'recycler_id'>;
  sync_metadata!: EntityTable<SyncMetadata, 'key'>;
  handovers!: EntityTable<Handover, 'id'>;
  payments!: EntityTable<Payment, 'id'>;

  constructor() {
    super('SahiRateDB');
    
    this.version(1).stores({
      lots: 'id, sync_status, created_at_local',
      photos: 'id, lot_id',
      outbox: 'id, sync_status, type, created_at_local',
      price_cache: 'material_id',
      recycler_cache: 'recycler_id',
      sync_metadata: 'key'
    });

    this.version(2).stores({
      lots: 'id, sync_status, created_at_local',
      photos: 'id, lot_id',
      outbox: 'id, sync_status, type, created_at_local',
      price_cache: 'material_id',
      recycler_cache: 'recycler_id',
      sync_metadata: 'key',
      handovers: 'id, lot_id, qr_reference, status',
      payments: 'id, handover_id, status'
    });
  }
}

export const db = new SahiRateDatabase();
