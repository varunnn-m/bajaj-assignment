import { Alert, Linking, PermissionsAndroid, Platform } from 'react-native';
import { State } from 'react-native-ble-plx';

import { APP_COPY } from '../utils/constants';
import {
  getBleState,
  promptIosBluetoothPermission,
} from '../services/ble/bleService';
import { PermissionState } from '../types/device';

export function usePermissions() {
  const requestPermissions = async (): Promise<PermissionState> => {
    if (Platform.OS === 'android') {
      const result = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ]);

      const values = Object.values(result);

      if (values.every(value => value === PermissionsAndroid.RESULTS.GRANTED)) {
        return 'granted';
      }

      if (values.some(value => value === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN)) {
        return 'blocked';
      }

      return 'denied';
    }

    const promptState = await promptIosBluetoothPermission();

    if (promptState === State.PoweredOn || promptState === State.PoweredOff) {
      return 'granted';
    }

    if (promptState === State.Unauthorized) {
      return 'blocked';
    }

    return 'denied';
  };

  const getCurrentPermissionState = async (): Promise<PermissionState> => {
    if (Platform.OS === 'android') {
      const permissions = await Promise.all([
        PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN),
        PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT),
        PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION),
      ]);

      return permissions.every(Boolean) ? 'granted' : 'denied';
    }

    const state = await getBleState();

    if (state === State.PoweredOn || state === State.PoweredOff) {
      return 'granted';
    }

    if (state === State.Unauthorized) {
      return 'blocked';
    }

    return 'unknown';
  };

  const promptToOpenSettings = (kind: 'bluetooth' | 'location') => {
    const title =
      kind === 'bluetooth'
        ? APP_COPY.bluetoothPermissionTitle
        : APP_COPY.locationPermissionTitle;
    const message =
      kind === 'bluetooth'
        ? APP_COPY.bluetoothPermissionMessage
        : APP_COPY.locationPermissionMessage;

    Alert.alert(title, message, [
      {
        text: APP_COPY.cancelButton,
        style: 'cancel',
      },
      {
        text: APP_COPY.settingsButton,
        onPress: () => {
          Linking.openSettings().catch(() => undefined);
        },
      },
    ]);
  };

  return {
    requestPermissions,
    getCurrentPermissionState,
    promptToOpenSettings,
  };
}
