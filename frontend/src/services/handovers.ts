import { v4 as uuidv4 } from "uuid";
import { db } from "../db/dexie";
import type { Handover, Payment, PaymentMode } from "../types";
import { processOutbox } from "./syncManager";

export async function createHandover(
  lotId: string,
  recyclerId: string,
  verifiedWeightKg: number,
  finalRate: number,
  finalAmount: number
): Promise<Handover> {
  const handoverId = uuidv4();
  const qrReference = uuidv4().substring(0, 8).toUpperCase();
  const now = new Date().toISOString();

  const handover: Handover = {
    id: handoverId,
    lot_id: lotId,
    recycler_id: recyclerId,
    verified_weight_kg: verifiedWeightKg,
    final_rate: finalRate,
    final_amount: finalAmount,
    status: "QR_GENERATED",
    qr_reference: qrReference,
    created_at_local: now,
  };

  await db.transaction("rw", db.handovers, db.outbox, async () => {
    // Check if one already exists for this lot to be strictly idempotent
    const existing = await db.handovers.where("lot_id").equals(lotId).first();
    if (existing) {
      throw new Error("Handover already exists for this lot");
    }

    await db.handovers.add(handover);
    await db.outbox.add({
      id: uuidv4(),
      type: "HANDOVER_CREATED",
      created_at_local: now,
      sync_status: "pending",
      idempotency_key: handoverId,
      payload: handover,
    });
  });

  if (typeof navigator !== "undefined" && navigator.onLine) {
    processOutbox().catch(console.error);
  }

  return handover;
}

export async function collectorConfirmHandover(handoverId: string): Promise<void> {
  const now = new Date().toISOString();
  let wasAlreadyConfirmed = false;
  const eventId = uuidv4();

  await db.transaction("rw", db.handovers, db.outbox, async () => {
    const handover = await db.handovers.get(handoverId);
    if (!handover) throw new Error("Handover not found");

    if (handover.status === "COLLECTOR_CONFIRMED" || handover.status === "COMPLETED") {
      wasAlreadyConfirmed = true;
      return;
    }

    await db.handovers.update(handoverId, {
      status: "COLLECTOR_CONFIRMED",
      collector_confirmed_at: now,
    });

    await db.outbox.add({
      id: eventId,
      type: "HANDOVER_COLLECTOR_CONFIRMED",
      created_at_local: now,
      sync_status: "pending",
      idempotency_key: eventId,
      payload: { handover_id: handoverId },
    });
  });

  if (wasAlreadyConfirmed) return;

  if (typeof navigator !== "undefined" && navigator.onLine) {
    processOutbox().catch(console.error);
  }
}

export async function recyclerCompleteHandover(handoverId: string): Promise<void> {
  const now = new Date().toISOString();
  let wasAlreadyCompleted = false;
  const eventId = uuidv4();

  await db.transaction("rw", db.handovers, db.lots, db.outbox, async () => {
    const handover = await db.handovers.get(handoverId);
    if (!handover) throw new Error("Handover not found");

    if (handover.status === "COMPLETED") {
      wasAlreadyCompleted = true;
      return;
    }

    await db.handovers.update(handoverId, {
      status: "COMPLETED",
      completed_at: now,
    });

    // Optional: Update lot status or leave it. We can update status to 'completed' but we don't have it in the type.
    // It's just accepted in lot. Let's rely on handovers.

    await db.outbox.add({
      id: eventId,
      type: "HANDOVER_COMPLETED",
      created_at_local: now,
      sync_status: "pending",
      idempotency_key: eventId,
      payload: { handover_id: handoverId },
    });
  });

  if (wasAlreadyCompleted) return;

  if (typeof navigator !== "undefined" && navigator.onLine) {
    processOutbox().catch(console.error);
  }
}

export async function recordPayment(
  handoverId: string,
  amount: number,
  mode: PaymentMode
): Promise<Payment> {
  const now = new Date().toISOString();
  const paymentId = uuidv4();
  const eventId = uuidv4();

  let existingPayment: Payment | undefined;

  await db.transaction("rw", db.payments, db.outbox, async () => {
    existingPayment = await db.payments.where("handover_id").equals(handoverId).first();
    if (existingPayment) {
      return;
    }

    const payment: Payment = {
      id: paymentId,
      handover_id: handoverId,
      amount,
      payment_mode: mode,
      status: "PAID",
      paid_at: now,
      created_at_local: now,
    };

    await db.payments.add(payment);

    await db.outbox.add({
      id: eventId,
      type: "PAYMENT_RECORDED",
      created_at_local: now,
      sync_status: "pending",
      idempotency_key: eventId,
      payload: payment,
    });
    existingPayment = payment;
  });

  if (typeof navigator !== "undefined" && navigator.onLine) {
    processOutbox().catch(console.error);
  }

  return existingPayment!;
}
