import { PendingSyncAction, SyncActionType } from '../types/device';
import { QUEUE_RETRY_BASE_MS, QUEUE_RETRY_MAX_MS } from './constants';

export function createPendingAction(
  type: SyncActionType,
  deviceId: string,
  deviceName: string,
): PendingSyncAction {
  return {
    id: `${type}-${deviceId}-${Date.now()}`,
    type,
    deviceId,
    deviceName,
    createdAt: Date.now(),
    attempts: 0,
    lastError: null,
  };
}

export function enqueuePendingAction(
  queue: PendingSyncAction[],
  action: PendingSyncAction,
): PendingSyncAction[] {
  return [...queue, action];
}

export function markPendingActionFailure(
  queue: PendingSyncAction[],
  actionId: string,
  error: string,
): PendingSyncAction[] {
  return queue.map(action =>
    action.id === actionId
      ? {
          ...action,
          attempts: action.attempts + 1,
          lastError: error,
        }
      : action,
  );
}

export function removePendingAction(
  queue: PendingSyncAction[],
  actionId: string,
): PendingSyncAction[] {
  return queue.filter(action => action.id !== actionId);
}

export function getNextRetryDelay(attempts: number): number {
  if (attempts <= 0) {
    return 0;
  }

  return Math.min(QUEUE_RETRY_BASE_MS * 2 ** (attempts - 1), QUEUE_RETRY_MAX_MS);
}
