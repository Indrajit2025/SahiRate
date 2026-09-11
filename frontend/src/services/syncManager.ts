import { db } from '@/db/dexie';
import { syncTransport } from '@/services/syncTransport';
import { useSyncStore } from '@/stores/syncStore';


let isSyncManagerRunning = false;

/**
 * Recovers any events that were interrupted (stuck in 'syncing' state)
 * back to 'pending' on application startup.
 */
async function recoverInterruptedSyncs() {
  const interrupted = await db.outbox.where('sync_status').equals('syncing').toArray();
  if (interrupted.length > 0) {
    console.log(`[SyncManager] Recovering ${interrupted.length} interrupted sync events back to pending.`);
    await db.transaction('rw', db.outbox, async () => {
      for (const event of interrupted) {
        await db.outbox.update(event.id, { sync_status: 'pending' });
      }
    });
  }
}

/**
 * Core synchronization loop.
 * Fetches pending/failed events and safely processes them.
 */
export async function processOutbox() {
  // Prevent concurrent sync loops
  if (isSyncManagerRunning) return;
  if (!navigator.onLine) return;

  isSyncManagerRunning = true;
  useSyncStore.getState().setIsSyncing(true);

  try {
    // Process one by one, sorting by creation date to guarantee order
    while (true) {
      if (!navigator.onLine) break; // Halts if network drops mid-sync

      // Fetch only the oldest pending/failed event without loading the whole queue
      const event = await db.outbox
        .orderBy('created_at_local')
        .filter(e => e.sync_status === 'pending' || e.sync_status === 'failed')
        .first();

      if (!event) break;

      // Mark as syncing
      await db.outbox.update(event.id, { sync_status: 'syncing' });

      try {
        await syncTransport.sendEvent(event);

        // Success: Update both outbox and parent entity atomically
        await db.transaction('rw', db.outbox, db.lots, async () => {
          await db.outbox.update(event.id, { sync_status: 'synced' });
          
          if (event.type === 'LOT_CREATED') {
            await db.lots.update(event.id, { sync_status: 'synced' });
          }
        });

      } catch (error: any) {
        if (error.name === 'NetworkError' || error.message?.includes('Failed to fetch')) {
          console.log(`[SyncManager] Network unavailable for event ${event.id}, reverting to pending.`);
          await db.outbox.update(event.id, { sync_status: 'pending' });
          useSyncStore.getState().setOnline(false);
        } else {
          // Failure: Mark as failed so it can be retried later
          console.error(`[SyncManager] Failed to sync event ${event.id}:`, error);
          await db.outbox.update(event.id, { sync_status: 'failed' });
        }
        // We break out of the loop on failure to avoid hammering the network
        break;
      }
    }
  } finally {
    isSyncManagerRunning = false;
    useSyncStore.getState().setIsSyncing(false);
  }
}

let initialized = false;

export function initSyncManager() {
  if (initialized) return;
  initialized = true;

  console.log('[SyncManager] Initializing...');

  // 1. Recover interrupted syncs immediately
  recoverInterruptedSyncs().then(() => {
    // 2. Attempt sync if already online
    if (navigator.onLine) {
      processOutbox();
    }
  });

  // 3. Setup network listeners
  window.addEventListener('online', () => {
    console.log('[SyncManager] Network online detected. Starting sync...');
    useSyncStore.getState().setOnline(true);
    processOutbox();
  });

  window.addEventListener('offline', () => {
    console.log('[SyncManager] Network offline detected.');
    useSyncStore.getState().setOnline(false);
  });
}
