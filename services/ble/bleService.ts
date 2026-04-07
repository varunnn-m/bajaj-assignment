import {
  BleError,
  BleErrorCode,
  BleManager,
  Device,
  State,
  Subscription,
} from 'react-native-ble-plx';
import { Platform } from 'react-native';

import { BLE_CONNECTION_TIMEOUT_MS } from '../../utils/constants';
import { PairedDevice, ScannedDevice } from '../../types/device';

const bleManager = new BleManager();

function normalizeServiceUUIDs(serviceUUIDs: string[] | null | undefined): string[] {
  return (serviceUUIDs ?? []).map(uuid => uuid.toLowerCase());
}

export function toScannedDevice(device: Device): ScannedDevice {
  return {
    id: device.id,
    name: device.name ?? device.localName ?? 'Unnamed BLE Device',
    localName: device.localName,
    rssi: device.rssi ?? null,
    serviceUUIDs: normalizeServiceUUIDs(device.serviceUUIDs),
    isConnectable: device.isConnectable ?? null,
    manufacturerData: device.manufacturerData ?? null,
    lastSeenAt: Date.now(),
  };
}

export function toPairedDevice(device: Device): PairedDevice {
  return {
    id: device.id,
    name: device.name ?? device.localName ?? 'Unnamed BLE Device',
    serviceUUIDs: normalizeServiceUUIDs(device.serviceUUIDs),
    pairedAt: Date.now(),
    lastSeenAt: Date.now(),
    rssi: device.rssi ?? null,
    isConnected: true,
    syncStatus: 'pending',
    lastSyncError: null,
  };
}

export function startBleScan(
  onDevice: (device: ScannedDevice) => void,
  onError: (message: string) => void,
): void {
  bleManager.startDeviceScan(null, {allowDuplicates: true}, (error, device) => {
    if (error) {
      onError(describeBleError(error));
      return;
    }

    if (!device) {
      return;
    }

    onDevice(toScannedDevice(device));
  });
}

export function stopBleScan(): void {
  bleManager.stopDeviceScan();
}

export async function connectToPeripheral(deviceId: string): Promise<PairedDevice> {
  const connectedDevice = await bleManager.connectToDevice(deviceId, {
    autoConnect: false,
    timeout: BLE_CONNECTION_TIMEOUT_MS,
  });
  const bondableDevice = connectedDevice as Device & {
    createBond?: () => Promise<Device>;
  };

  if (Platform.OS === 'android' && typeof bondableDevice.createBond === 'function') {
    try {
      await bondableDevice.createBond();
    } catch {
      // Some devices do not require or support bonding. Connection can still proceed.
    }
  }

  const discoveredDevice =
    await connectedDevice.discoverAllServicesAndCharacteristics();

  return toPairedDevice(discoveredDevice);
}

export async function disconnectFromPeripheral(deviceId: string): Promise<void> {
  const isConnected = await bleManager.isDeviceConnected(deviceId);

  if (isConnected) {
    await bleManager.cancelDeviceConnection(deviceId);
  }
}

export function monitorBleState(listener: (state: State) => void): Subscription {
  return bleManager.onStateChange(listener, true);
}

export function monitorUnexpectedDisconnect(
  deviceId: string,
  listener: (errorMessage: string | null) => void,
): Subscription {
  return bleManager.onDeviceDisconnected(deviceId, error => {
    listener(error ? describeBleError(error) : null);
  });
}

export async function getBleState(): Promise<State> {
  return bleManager.state();
}

export async function promptIosBluetoothPermission(): Promise<State> {
  if (Platform.OS !== 'ios') {
    return bleManager.state();
  }

  return new Promise(resolve => {
    let settled = false;

    const subscription = bleManager.onStateChange(state => {
      if (state !== State.Unknown && !settled) {
        settled = true;
        subscription.remove();
        bleManager.stopDeviceScan();
        resolve(state);
      }
    }, true);

    bleManager.startDeviceScan(null, null, () => undefined);

    setTimeout(async () => {
      if (!settled) {
        settled = true;
        subscription.remove();
        bleManager.stopDeviceScan();
        resolve(await bleManager.state());
      }
    }, 1200);
  });
}

export function describeBleError(error: BleError | Error): string {
  if ('errorCode' in error) {
    switch (error.errorCode) {
      case BleErrorCode.BluetoothUnauthorized:
        return 'Bluetooth permission was denied. Please enable it in Settings.';
      case BleErrorCode.BluetoothPoweredOff:
        return 'Bluetooth is turned off. Please enable Bluetooth to continue.';
      case BleErrorCode.DeviceConnectionFailed:
        return 'Could not connect to the device. Make sure it is nearby and powered on.';
      case BleErrorCode.DeviceDisconnected:
        return 'The BLE device disconnected unexpectedly.';
      case BleErrorCode.OperationTimedOut:
        return 'Bluetooth operation timed out. Please try again.';
      default:
        break;
    }
  }

  return error.message || 'An unexpected Bluetooth error occurred.';
}
