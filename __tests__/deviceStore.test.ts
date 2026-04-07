import { upsertPairedDeviceRecord } from '../store/deviceStore';
import { PairedDevice } from '../types/device';

describe('deviceStore helpers', () => {
  it('upserts paired devices without losing existing values', () => {
    const baseDevice: PairedDevice = {
      id: 'dev-1',
      name: 'Sensor 1',
      serviceUUIDs: ['0000abcd'],
      pairedAt: 1,
      lastSeenAt: 1,
      rssi: -55,
      isConnected: true,
      syncStatus: 'pending',
      lastSyncError: null,
    };

    const initial = upsertPairedDeviceRecord({}, baseDevice);
    const next = upsertPairedDeviceRecord(initial, {
      ...baseDevice,
      isConnected: false,
      syncStatus: 'synced',
      rssi: -48,
    });

    expect(Object.keys(next)).toHaveLength(1);
    expect(next['dev-1']).toMatchObject({
      name: 'Sensor 1',
      isConnected: false,
      syncStatus: 'synced',
      rssi: -48,
    });
  });
});
