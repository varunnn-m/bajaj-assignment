import { useCallback, useEffect } from 'react';

import { deregisterDevice, MockApiError, registerDevice } from '../services/api/mockDeviceApi';
import { useDeviceStore } from '../store/deviceStore';
import { useSyncStore } from '../store/syncStore';
import { getNextRetryDelay } from '../utils/queueManager';
import { subscribeToNetworkChanges } from '../utils/networkListener';

export function useSyncQueue() {
  const queue = useSyncStore(state => state.queue);
  const isProcessing = useSyncStore(state => state.isProcessing);
  const isOnline = useSyncStore(state => state.isOnline);
  const setOnline = useSyncStore(state => state.setOnline);
  const setProcessing = useSyncStore(state => state.setProcessing);
  const remove = useSyncStore(state => state.remove);
  const markFailure = useSyncStore(state => state.markFailure);
  const setLastSyncEvent = useSyncStore(state => state.setLastSyncEvent);
  const setSyncStatus = useDeviceStore(state => state.setSyncStatus);

  const processQueue = useCallback(async () => {
    if (isProcessing || !isOnline || queue.length === 0) {
      return;
    }

    setProcessing(true);

    try {
      while (useSyncStore.getState().queue.length > 0 && useSyncStore.getState().isOnline) {
        const currentAction = useSyncStore.getState().queue[0];

        if (!currentAction) {
          break;
        }

        if (currentAction.type === 'REGISTER') {
          setSyncStatus(currentAction.deviceId, 'pending', currentAction.lastError);
        }

        try {
          if (currentAction.type === 'REGISTER') {
            await registerDevice(currentAction.deviceId);
            setSyncStatus(currentAction.deviceId, 'synced', null);
            setLastSyncEvent(`Registered ${currentAction.deviceName} with the mock cloud.`);
          } else {
            await deregisterDevice(currentAction.deviceId);
            setLastSyncEvent(`Deregistered ${currentAction.deviceName} from the mock cloud.`);
          }

          remove(currentAction.id);
        } catch (error) {
          const message =
            error instanceof Error ? error.message : 'Sync failed unexpectedly.';
          markFailure(currentAction.id, message);

          if (currentAction.type === 'REGISTER') {
            setSyncStatus(currentAction.deviceId, 'failed', message);
          }

          if (error instanceof MockApiError && error.code === 'OFFLINE') {
            setOnline(false);
          }

          break;
        }
      }
    } finally {
      setProcessing(false);
    }
  }, [
    isOnline,
    isProcessing,
    markFailure,
    queue.length,
    remove,
    setLastSyncEvent,
    setOnline,
    setProcessing,
    setSyncStatus,
  ]);

  useEffect(() => {
    return subscribeToNetworkChanges(state => {
      const reachable =
        state.isConnected !== false && state.isInternetReachable !== false;
      setOnline(reachable);
    });
  }, [setOnline]);

  useEffect(() => {
    if (!isOnline || queue.length === 0 || isProcessing) {
      return;
    }

    const nextAction = queue[0];
    const delay = getNextRetryDelay(nextAction?.attempts ?? 0);

    const timeout = setTimeout(() => {
      processQueue().catch(() => undefined);
    }, delay);

    return () => clearTimeout(timeout);
  }, [isOnline, isProcessing, processQueue, queue]);
}
