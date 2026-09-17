import type { OutboxEvent } from '@/types';
import { useSyncStore } from '@/stores/syncStore';

export interface ISyncTransport {
  sendEvent(event: OutboxEvent): Promise<void>;
}

class MockTransport implements ISyncTransport {
  async sendEvent(event: OutboxEvent): Promise<void> {
    console.log(`[MockTransport] Sending event: ${event.type} (ID: ${event.id})`);
    const shouldFail = useSyncStore.getState().failNextSync;
    if (shouldFail) {
      useSyncStore.getState().setFailNextSync(false);
    }
    
    try {
      // Use / instead of /api/mock-ping to test true frontend accessibility
      // as mock-ping doesn't exist yet and might confuse logs.
      const res = await fetch(`/?_t=${Date.now()}`, { method: 'HEAD', cache: 'no-store' });
      if (!res.ok && res.status !== 404) {
         console.warn(`[MockTransport] API returned ${res.status}, network is up but server may be struggling.`);
      } else {
         console.log(`[MockTransport] API/Server reachable.`);
      }
    } catch (e) {
      const err = new Error("Mock transport: True offline state detected (fetch failed).");
      err.name = "NetworkError";
      throw err;
    }

    await new Promise(resolve => setTimeout(resolve, 1000));

    if (shouldFail) {
      throw new Error("Simulated network or backend failure.");
    }

    console.log(`[MockTransport] Successfully processed event: ${event.id}`);
  }
}

export const syncTransport: ISyncTransport = new MockTransport();
