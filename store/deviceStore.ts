import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { zustandStorage } from '../services/storage/mmkv';
import { PairedDevice, SyncStatus } from '../types/device';

export interface DeviceStoreState {
  pairedDevices: Record<string, PairedDevice>;
  upsertPairedDevice: (device: PairedDevice) => void;
  removePairedDevice: (deviceId: string) => void;
  setDeviceConnection: (deviceId: string, isConnected: boolean) => void;
  setDeviceSeen: (deviceId: string, rssi: number | null) => void;
  setSyncStatus: (
    deviceId: string,
    syncStatus: SyncStatus,
    lastSyncError?: string | null,
  ) => void;
  reset: () => void;
}

export function upsertPairedDeviceRecord(
  pairedDevices: Record<string, PairedDevice>,
  device: PairedDevice,
): Record<string, PairedDevice> {
  return {
    ...pairedDevices,
    [device.id]: {
      ...pairedDevices[device.id],
      ...device,
    },
  };
}

export const useDeviceStore = create<DeviceStoreState>()(
  persist(
    set => ({
      pairedDevices: {},
      upsertPairedDevice: device =>
        set(state => ({
          pairedDevices: upsertPairedDeviceRecord(state.pairedDevices, device),
        })),
      removePairedDevice: deviceId =>
        set(state => {
          const next = {...state.pairedDevices};
          delete next[deviceId];
          return {pairedDevices: next};
        }),
      setDeviceConnection: (deviceId, isConnected) =>
        set(state => {
          const device = state.pairedDevices[deviceId];

          if (!device) {
            return state;
          }

          return {
            pairedDevices: {
              ...state.pairedDevices,
              [deviceId]: {
                ...device,
                isConnected,
              },
            },
          };
        }),
      setDeviceSeen: (deviceId, rssi) =>
        set(state => {
          const device = state.pairedDevices[deviceId];

          if (!device) {
            return state;
          }

          return {
            pairedDevices: {
              ...state.pairedDevices,
              [deviceId]: {
                ...device,
                rssi,
                lastSeenAt: Date.now(),
              },
            },
          };
        }),
      setSyncStatus: (deviceId, syncStatus, lastSyncError = null) =>
        set(state => {
          const device = state.pairedDevices[deviceId];

          if (!device) {
            return state;
          }

          return {
            pairedDevices: {
              ...state.pairedDevices,
              [deviceId]: {
                ...device,
                syncStatus,
                lastSyncError,
              },
            },
          };
        }),
      reset: () => set({pairedDevices: {}}),
    }),
    {
      name: 'device-store',
      storage: createJSONStorage(() => zustandStorage),
    },
  ),
);
