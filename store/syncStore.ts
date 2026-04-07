import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { zustandStorage } from '../services/storage/mmkv';
import { PendingSyncAction } from '../types/device';
import {
  enqueuePendingAction,
  markPendingActionFailure,
  removePendingAction,
} from '../utils/queueManager';

interface SyncStoreState {
  queue: PendingSyncAction[];
  isProcessing: boolean;
  isOnline: boolean;
  lastSyncEvent: string | null;
  enqueue: (action: PendingSyncAction) => void;
  remove: (actionId: string) => void;
  markFailure: (actionId: string, error: string) => void;
  setProcessing: (isProcessing: boolean) => void;
  setOnline: (isOnline: boolean) => void;
  setLastSyncEvent: (message: string | null) => void;
}

export const useSyncStore = create<SyncStoreState>()(
  persist(
    set => ({
      queue: [],
      isProcessing: false,
      isOnline: true,
      lastSyncEvent: null,
      enqueue: action =>
        set(state => ({
          queue: enqueuePendingAction(state.queue, action),
        })),
      remove: actionId =>
        set(state => ({
          queue: removePendingAction(state.queue, actionId),
        })),
      markFailure: (actionId, error) =>
        set(state => ({
          queue: markPendingActionFailure(state.queue, actionId, error),
        })),
      setProcessing: isProcessing => set({isProcessing}),
      setOnline: isOnline => set({isOnline}),
      setLastSyncEvent: lastSyncEvent => set({lastSyncEvent}),
    }),
    {
      name: 'sync-store',
      storage: createJSONStorage(() => zustandStorage),
      partialize: state => ({queue: state.queue}),
    },
  ),
);
