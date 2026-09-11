import { v4 as uuidv4 } from "uuid";
import { db } from "../db/dexie";
import type { Lot, LotPayload, OutboxEvent } from "../types";
import { processOutbox } from "./syncManager";

/**
 * Creates a lot entirely offline and queues it in the outbox for synchronization.
 */
export async function createLocalLot(
  payload: LotPayload,
  explicitId?: string,
): Promise<Lot> {
  const lotId = explicitId || uuidv4();

  // Idempotency: If this lot ID already exists in the database, return early to prevent duplicates
  // and ConstraintErrors in case of crash recovery (e.g., user hits "Confirm" again after a reload)
  const existingLot = await db.lots.get(lotId);
  if (existingLot) {
    console.log(`[Lots] Lot ${lotId} already exists. Skipping recreation.`);
    if (typeof navigator !== "undefined" && navigator.onLine) {
      processOutbox().catch(console.error);
    }
    return existingLot;
  }

  const transactionId = lotId;
  const now = new Date().toISOString();

  const lot: Lot = {
    id: transactionId,
    sync_status: "pending",
    created_at_local: now,
    payload,
  };

  const outboxEvent: OutboxEvent = {
    id: transactionId,
    type: "LOT_CREATED",
    created_at_local: now,
    sync_status: "pending",
    idempotency_key: transactionId, // Prevents duplicate creation on the backend
    payload,
  };

  // Run in a transaction to ensure both records are saved or neither are.
  await db.transaction("rw", db.lots, db.outbox, async () => {
    await db.lots.add(lot);
    await db.outbox.add(outboxEvent);
  });

  // Trigger auto-sync if currently online
  if (typeof navigator !== "undefined" && navigator.onLine) {
    // Fire and forget to avoid blocking the UI response
    processOutbox().catch(console.error);
  }

  return lot;
}

/**
 * Fetch all local lots, ordered by creation date descending.
 */
export async function getLocalLots(): Promise<Lot[]> {
  return await db.lots.orderBy("created_at_local").reverse().toArray();
}

export const DEMO_RECYCLER_ID = "demo-recycler-123";

/**
 * Accepts a local lot and queues the acceptance for sync.
 * Idempotent: returns early if already accepted.
 */
export async function acceptLocalLot(
  lotId: string,
  recyclerId: string = DEMO_RECYCLER_ID,
): Promise<void> {
  const now = new Date().toISOString();
  const eventId = uuidv4();
  let wasAlreadyAccepted = false;

  await db.transaction("rw", db.lots, db.outbox, async () => {
    // Read the lot INSIDE the transaction to ensure atomicity against concurrent accepts
    const lot = await db.lots.get(lotId);
    if (!lot) throw new Error("Lot not found");

    const currentStatus = lot.status || "available";
    if (currentStatus === "accepted") {
      wasAlreadyAccepted = true;
      return;
    }

    await db.lots.update(lotId, {
      status: "accepted",
      accepted_by: recyclerId,
      accepted_at: now,
    });

    await db.outbox.add({
      id: eventId,
      type: "LOT_ACCEPTED",
      created_at_local: now,
      sync_status: "pending",
      idempotency_key: eventId,
      payload: { lot_id: lotId, recycler_id: recyclerId },
    });
  });

  if (wasAlreadyAccepted) {
    console.log(`[Lots] Lot ${lotId} is already accepted. Idempotent return.`);
    return;
  }

  if (typeof navigator !== "undefined" && navigator.onLine) {
    processOutbox().catch(console.error);
  }
}
