import { State } from 'react-native-ble-plx';
import { create } from 'zustand';

import { ScannedDevice } from '../types/device';

const UNNAMED_BLE_DEVICE = 'Unnamed BLE Device';

export function upsertScannedDeviceRecord(
  scannedDevices: Record<string, ScannedDevice>,
  device: ScannedDevice,
): Record<string, ScannedDevice> {
  const existingDevice = scannedDevices[device.id];
  const nextName =
    device.name === UNNAMED_BLE_DEVICE && existingDevice?.name
      ? existingDevice.name
      : device.name;

  return {
    ...scannedDevices,
    [device.id]: {
      ...existingDevice,
      ...device,
      name: nextName,
      discoveredAt: existingDevice?.discoveredAt ?? device.discoveredAt,
    },
  };
}

interface BleStoreState {
  scannedDevices: Record<string, ScannedDevice>;
  isScanning: boolean;
  connectingDeviceId: string | null;
  bluetoothState: State | 'Unknown';
  lastBleError: string | null;
  upsertScannedDevice: (device: ScannedDevice) => void;
  clearScanResults: () => void;
  setScanning: (isScanning: boolean) => void;
  setConnectingDeviceId: (deviceId: string | null) => void;
  setBluetoothState: (state: State | 'Unknown') => void;
  setBleError: (error: string | null) => void;
}

export const useBleStore = create<BleStoreState>(set => ({
  scannedDevices: {},
  isScanning: false,
  connectingDeviceId: null,
  bluetoothState: 'Unknown',
  lastBleError: null,
  upsertScannedDevice: device =>
    set(state => ({
      scannedDevices: upsertScannedDeviceRecord(state.scannedDevices, device),
    })),
  clearScanResults: () => set({scannedDevices: {}}),
  setScanning: isScanning => set({isScanning}),
  setConnectingDeviceId: connectingDeviceId => set({connectingDeviceId}),
  setBluetoothState: bluetoothState => set({bluetoothState}),
  setBleError: lastBleError => set({lastBleError}),
}));
