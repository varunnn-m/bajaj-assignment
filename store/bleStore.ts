import { State } from 'react-native-ble-plx';
import { create } from 'zustand';

import { ScannedDevice } from '../types/device';

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
      scannedDevices: {
        ...state.scannedDevices,
        [device.id]: {
          ...state.scannedDevices[device.id],
          ...device,
        },
      },
    })),
  clearScanResults: () => set({scannedDevices: {}}),
  setScanning: isScanning => set({isScanning}),
  setConnectingDeviceId: connectingDeviceId => set({connectingDeviceId}),
  setBluetoothState: bluetoothState => set({bluetoothState}),
  setBleError: lastBleError => set({lastBleError}),
}));
