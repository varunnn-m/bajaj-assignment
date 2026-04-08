import { upsertScannedDeviceRecord } from '../store/bleStore';
import { ScannedDevice } from '../types/device';

describe('bleStore helpers', () => {
  it('preserves original discovery order when a scanned device updates', () => {
    const firstSeen: ScannedDevice = {
      id: 'dev-1',
      name: 'Sensor 1',
      rssi: -80,
      serviceUUIDs: ['1234'],
      isConnectable: true,
      manufacturerData: null,
      discoveredAt: 100,
      lastSeenAt: 100,
    };

    const rescanned: ScannedDevice = {
      ...firstSeen,
      rssi: -45,
      discoveredAt: 200,
      lastSeenAt: 200,
    };

    const stored = upsertScannedDeviceRecord({}, firstSeen);
    const updated = upsertScannedDeviceRecord(stored, rescanned);

    expect(updated['dev-1']).toMatchObject({
      rssi: -45,
      lastSeenAt: 200,
      discoveredAt: 100,
    });
  });
});
