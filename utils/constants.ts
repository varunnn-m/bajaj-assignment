export const TARGET_SERVICE_UUID_PREFIX = '0000';
export const BLE_CONNECTION_TIMEOUT_MS = 15000;
export const MOCK_API_MIN_DELAY_MS = 600;
export const MOCK_API_MAX_DELAY_MS = 1500;
export const MOCK_API_FAILURE_RATE = 0.35;
export const QUEUE_RETRY_BASE_MS = 4000;
export const QUEUE_RETRY_MAX_MS = 30000;

export const APP_COPY = {
  bluetoothPermissionTitle: 'Bluetooth access required',
  bluetoothPermissionMessage:
    'Bluetooth access is needed to discover, pair, and manage nearby IoT devices.',
  locationPermissionTitle: 'Location permission required',
  locationPermissionMessage:
    'Android requires location access for BLE scanning. You can change this anytime in Settings.',
  settingsButton: 'Open Settings',
  cancelButton: 'Not now',
};
