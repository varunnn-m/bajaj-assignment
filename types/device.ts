export type SyncStatus = 'synced' | 'pending' | 'failed';

export type SyncActionType = 'REGISTER' | 'DEREGISTER';

export type PermissionState =
  | 'unknown'
  | 'granted'
  | 'denied'
  | 'blocked'
  | 'unavailable';

export interface ScannedDevice {
  id: string;
  name: string;
  rssi: number | null;
  serviceUUIDs: string[];
  isConnectable: boolean | null;
  manufacturerData: string | null;
  discoveredAt: number;
  lastSeenAt: number;
}

export interface PairedDevice {
  id: string;
  name: string;
  serviceUUIDs: string[];
  pairedAt: number;
  lastSeenAt: number;
  rssi: number | null;
  isConnected: boolean;
  syncStatus: SyncStatus;
  lastSyncError: string | null;
}

export interface PendingSyncAction {
  id: string;
  type: SyncActionType;
  deviceId: string;
  deviceName: string;
  createdAt: number;
  attempts: number;
  lastError: string | null;
}

export interface ApiResult {
  ok: true;
  deviceId: string;
  syncedAt: number;
}
