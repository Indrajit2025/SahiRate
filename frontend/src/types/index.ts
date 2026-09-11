export type SyncStatus = "pending" | "syncing" | "synced" | "failed";

export interface LotPayload {
  material_id?: string;
  approx_weight_kg?: number;
  estimated_value?: number;
  photo_reference?: string;
  latitude?: number;
  longitude?: number;
}

export interface Lot {
  id: string; // client-generated-uuid
  sync_status: SyncStatus;
  created_at_local: string; // ISO string
  status?: "available" | "accepted";
  accepted_by?: string;
  accepted_at?: string;
  payload: LotPayload;
}

export interface OutboxEvent {
  id: string; // client-generated-uuid
  type: string; // e.g. "LOT_CREATED"
  created_at_local: string; // ISO string
  sync_status: SyncStatus;
  idempotency_key: string;
  payload: any;
}

export interface Photo {
  id: string;
  lot_id: string;
  data_uri: string; // base64 or blob URL
  created_at_local: string;
}

export interface PriceCache {
  material_id: string;
  price_min: number;
  price_max: number;
  currency: string;
  last_updated: string;
}

export interface RecyclerCache {
  recycler_id: string;
  name: string;
  distance_km: number;
  price_per_kg: number;
  pickup_available: boolean;
  authorized: boolean;
  last_updated: string;
}

export interface SyncMetadata {
  key: string;
  last_sync_time: string;
}
