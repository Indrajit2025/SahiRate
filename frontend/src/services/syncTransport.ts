import type { OutboxEvent } from '../types';
import { useSyncStore } from '../stores/syncStore';

export interface ISyncTransport {
  sendEvent(event: OutboxEvent): Promise<void>;
}

/**
 * MOCK/DEMO TRANSPORT
 * This simulates network latency and allows deterministic failures for testing.
 * In M12, this will be completely replaced by FastAPITransport without changing the sync manager.
 */
class MockTransport implements ISyncTransport {
  async sendEvent(event: OutboxEvent): Promise<void> {
    console.log(`[MockTransport] Sending event: ${event.type} (ID: ${event.id})`);
    console.log(`[MockTransport] Idempotency Key: ${event.idempotency_key}`);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check for deterministic failure
    const shouldFail = useSyncStore.getState().failNextSync;
    
    if (shouldFail) {
      // Consume the failure toggle so it only fails once per toggle
      useSyncStore.getState().setFailNextSync(false);
      console.error(`[MockTransport] Simulated failure triggered for event ${event.id}`);
      throw new Error("Simulated network or backend failure.");
    }

    console.log(`[MockTransport] Successfully processed event: ${event.id}`);
  }
}

export const syncTransport: ISyncTransport = new MockTransport();
