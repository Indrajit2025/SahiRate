import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/dexie';
import type { Lot, LotPayload, OutboxEvent } from '../types';

/**
 * Creates a lot entirely offline and queues it in the outbox for synchronization.
 */
export async function createLocalLot(payload: LotPayload): Promise<Lot> {
  const transactionId = uuidv4();
  const now = new Date().toISOString();
  
  const lot: Lot = {
    id: transactionId,
    sync_status: 'pending',
    created_at_local: now,
    payload
  };

  const outboxEvent: OutboxEvent = {
    id: transactionId,
    type: 'LOT_CREATED',
    created_at_local: now,
    sync_status: 'pending',
    idempotency_key: transactionId, // Prevents duplicate creation on the backend
    payload
  };

  // Run in a transaction to ensure both records are saved or neither are.
  await db.transaction('rw', db.lots, db.outbox, async () => {
    await db.lots.add(lot);
    await db.outbox.add(outboxEvent);
  });

  return lot;
}

/**
 * Fetch all local lots, ordered by creation date descending.
 */
export async function getLocalLots(): Promise<Lot[]> {
  return await db.lots.orderBy('created_at_local').reverse().toArray();
}
