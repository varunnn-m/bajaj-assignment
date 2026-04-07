import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, AppState, AppStateStatus } from 'react-native';
import { State, Subscription } from 'react-native-ble-plx';

import {
  connectToPeripheral,
  describeBleError,
  disconnectFromPeripheral,
  monitorBleState,
  monitorUnexpectedDisconnect,
  startBleScan,
  stopBleScan,
} from '../services/ble/bleService';
import { deregisterDevice, registerDevice } from '../services/api/mockDeviceApi';
import { useBleStore } from '../store/bleStore';
import { useDeviceStore } from '../store/deviceStore';
import { useSyncStore } from '../store/syncStore';
import { PermissionState, ScannedDevice } from '../types/device';
import { createPendingAction } from '../utils/queueManager';
import { usePermissions } from './usePermissions';

export function useBLE() {
  const scannedDevices = useBleStore(state => state.scannedDevices);
  const isScanning = useBleStore(state => state.isScanning);
  const connectingDeviceId = useBleStore(state => state.connectingDeviceId);
  const lastBleError = useBleStore(state => state.lastBleError);
  const upsertScannedDevice = useBleStore(state => state.upsertScannedDevice);
  const clearScanResults = useBleStore(state => state.clearScanResults);
  const setScanning = useBleStore(state => state.setScanning);
  const setConnectingDeviceId = useBleStore(state => state.setConnectingDeviceId);
  const setBluetoothState = useBleStore(state => state.setBluetoothState);
  const setBleError = useBleStore(state => state.setBleError);

  const upsertPairedDevice = useDeviceStore(state => state.upsertPairedDevice);
  const removePairedDevice = useDeviceStore(state => state.removePairedDevice);
  const setDeviceConnection = useDeviceStore(state => state.setDeviceConnection);
  const setDeviceSeen = useDeviceStore(state => state.setDeviceSeen);
  const setSyncStatus = useDeviceStore(state => state.setSyncStatus);

  const enqueue = useSyncStore(state => state.enqueue);
  const [permissionState, setPermissionState] = useState<PermissionState>('unknown');

  const disconnectSubscriptions = useRef<Record<string, Subscription>>({});
  const shouldResumeScan = useRef(false);

  const {getCurrentPermissionState, promptToOpenSettings, requestPermissions} =
    usePermissions();

  const attachDisconnectMonitor = useCallback((deviceId: string) => {
    disconnectSubscriptions.current[deviceId]?.remove();

    disconnectSubscriptions.current[deviceId] = monitorUnexpectedDisconnect(
      deviceId,
      errorMessage => {
        setDeviceConnection(deviceId, false);

        if (errorMessage) {
          setBleError(errorMessage);
        }
      },
    );
  }, [setBleError, setDeviceConnection]);

  const ensurePermissions = useCallback(async () => {
    const currentState = await getCurrentPermissionState();

    if (currentState === 'granted') {
      setPermissionState('granted');
      return true;
    }

    const requestedState = await requestPermissions();
    setPermissionState(requestedState);

    if (requestedState === 'granted') {
      return true;
    }

    promptToOpenSettings('bluetooth');
    return false;
  }, [getCurrentPermissionState, promptToOpenSettings, requestPermissions]);

  const beginScan = useCallback(async () => {
    const isGranted = await ensurePermissions();

    if (!isGranted) {
      setScanning(false);
      return;
    }

    clearScanResults();
    setBleError(null);
    setScanning(true);

    startBleScan(
      device => {
        upsertScannedDevice(device);

        if (useDeviceStore.getState().pairedDevices[device.id]) {
          setDeviceSeen(device.id, device.rssi);
        }
      },
      message => {
        setBleError(message);
        setScanning(false);

        if (message.includes('permission')) {
          setPermissionState('blocked');
        }
      },
    );
  }, [
    clearScanResults,
    ensurePermissions,
    setBleError,
    setDeviceSeen,
    setScanning,
    upsertScannedDevice,
  ]);

  const endScan = useCallback(() => {
    shouldResumeScan.current = false;
    stopBleScan();
    setScanning(false);
  }, [setScanning]);

  const pairDevice = useCallback(async (device: ScannedDevice) => {
    const isGranted = await ensurePermissions();

    if (!isGranted) {
      return;
    }

    setConnectingDeviceId(device.id);
    setBleError(null);

    try {
      const pairedDevice = await connectToPeripheral(device.id, device);
      const resolvedName =
        device.name === 'Unnamed BLE Device' ? pairedDevice.name : device.name;

      upsertPairedDevice({
        ...pairedDevice,
        name: resolvedName,
        serviceUUIDs: device.serviceUUIDs,
        rssi: device.rssi,
        lastSeenAt: Date.now(),
      });
      upsertScannedDevice({
        ...device,
        name: resolvedName,
        lastSeenAt: Date.now(),
      });
      attachDisconnectMonitor(device.id);

      try {
        await registerDevice(device.id);
        setSyncStatus(device.id, 'synced', null);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Cloud registration failed.';
        enqueue(createPendingAction('REGISTER', device.id, resolvedName));
        setSyncStatus(device.id, 'pending', message);
      }
    } catch (error) {
      setBleError(describeBleError(error as Error));
    } finally {
      setConnectingDeviceId(null);
    }
  }, [
    attachDisconnectMonitor,
    enqueue,
    ensurePermissions,
    setBleError,
    setConnectingDeviceId,
    setSyncStatus,
    upsertScannedDevice,
    upsertPairedDevice,
  ]);

  const unpairDevice = useCallback(async (deviceId: string) => {
    const existingDevice = useDeviceStore.getState().pairedDevices[deviceId];

    if (!existingDevice) {
      return;
    }

    try {
      await disconnectFromPeripheral(deviceId);
    } catch {
      // The device may already be disconnected. Local cleanup should still happen.
    }

    disconnectSubscriptions.current[deviceId]?.remove();
    delete disconnectSubscriptions.current[deviceId];
    removePairedDevice(deviceId);

    try {
      await deregisterDevice(deviceId);
    } catch {
      enqueue(createPendingAction('DEREGISTER', deviceId, existingDevice.name));
      Alert.alert(
        'Cloud sync queued',
        `${existingDevice.name} was removed locally. Cloud deregistration will retry automatically.`,
      );
    }
  }, [enqueue, removePairedDevice]);

  useEffect(() => {
    const stateSubscription = monitorBleState(nextState => {
      setBluetoothState(nextState);

      if (nextState === State.Unauthorized) {
        setPermissionState('blocked');
      }
    });

    const appStateSubscription = AppState.addEventListener(
      'change',
      (nextState: AppStateStatus) => {
        if (nextState !== 'active' && useBleStore.getState().isScanning) {
          shouldResumeScan.current = true;
          stopBleScan();
          setScanning(false);
          return;
        }

        if (nextState === 'active' && shouldResumeScan.current) {
          shouldResumeScan.current = false;
          beginScan().catch(() => undefined);
        }
      },
    );

    const subscriptions = disconnectSubscriptions.current;

    return () => {
      stateSubscription.remove();
      appStateSubscription.remove();
      Object.values(subscriptions).forEach(subscription => subscription.remove());
    };
  }, [beginScan, setBluetoothState, setScanning]);

  return {
    scannedDevices,
    isScanning,
    connectingDeviceId,
    lastBleError,
    permissionState,
    beginScan,
    endScan,
    pairDevice,
    unpairDevice,
  };
}
