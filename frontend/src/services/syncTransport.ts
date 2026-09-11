import type { OutboxEvent } from '@/types';
import { useSyncStore } from '@/stores/syncStore';

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
    // Consume flag before the await to ensure it captures the exact intent reliably
    const shouldFail = useSyncStore.getState().failNextSync;
    if (shouldFail) {
      useSyncStore.getState().setFailNextSync(false);
    }
    
    // Check actual connectivity, because navigator.onLine can lie.
    // Fetch an un-cached endpoint. If truly offline, this throws instantly.
    try {
      await fetch(`/api/mock-ping?_t=${Date.now()}`, { method: 'HEAD', cache: 'no-store' });
    } catch (e) {
      const err = new Error("Mock transport: True offline state detected (fetch failed).");
      err.name = "NetworkError";
      throw err;
    }

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (shouldFail) {
      console.error(`[MockTransport] Simulated failure triggered for event ${event.id}`);
      throw new Error("Simulated network or backend failure.");
    }

    console.log(`[MockTransport] Successfully processed event: ${event.id}`);
  }
}

export const syncTransport: ISyncTransport = new MockTransport();
