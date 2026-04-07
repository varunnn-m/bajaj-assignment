import { ApiResult } from '../../types/device';
import {
  MOCK_API_FAILURE_RATE,
  MOCK_API_MAX_DELAY_MS,
  MOCK_API_MIN_DELAY_MS,
} from '../../utils/constants';
import { isNetworkReachable } from '../../utils/networkListener';

export class MockApiError extends Error {
  code: 'OFFLINE' | 'SERVER_ERROR';

  constructor(message: string, code: 'OFFLINE' | 'SERVER_ERROR') {
    super(message);
    this.code = code;
  }
}

function randomDelay() {
  return (
    MOCK_API_MIN_DELAY_MS +
    Math.floor(Math.random() * (MOCK_API_MAX_DELAY_MS - MOCK_API_MIN_DELAY_MS))
  );
}

async function simulateRequest(deviceId: string): Promise<ApiResult> {
  const online = await isNetworkReachable();

  await new Promise<void>(resolve => setTimeout(() => resolve(), randomDelay()));

  if (!online) {
    throw new MockApiError('No network connection. Request queued for retry.', 'OFFLINE');
  }

  if (Math.random() < MOCK_API_FAILURE_RATE) {
    throw new MockApiError('Mock cloud sync failed. We will retry automatically.', 'SERVER_ERROR');
  }

  return {
    ok: true,
    deviceId,
    syncedAt: Date.now(),
  };
}

export async function registerDevice(deviceId: string): Promise<ApiResult> {
  return simulateRequest(deviceId);
}

export async function deregisterDevice(deviceId: string): Promise<ApiResult> {
  return simulateRequest(deviceId);
}
