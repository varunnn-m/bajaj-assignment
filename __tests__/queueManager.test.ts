import {
  createPendingAction,
  enqueuePendingAction,
  getNextRetryDelay,
  markPendingActionFailure,
  removePendingAction,
} from '../utils/queueManager';

describe('queueManager', () => {
  it('enqueues and removes actions in order', () => {
    const first = createPendingAction('REGISTER', 'dev-1', 'Sensor 1');
    const second = createPendingAction('DEREGISTER', 'dev-2', 'Sensor 2');

    const queued = enqueuePendingAction([], first);
    const updated = enqueuePendingAction(queued, second);

    expect(updated.map(action => action.deviceId)).toEqual(['dev-1', 'dev-2']);
    expect(removePendingAction(updated, first.id).map(action => action.deviceId)).toEqual([
      'dev-2',
    ]);
  });

  it('tracks retries with bounded backoff', () => {
    const action = createPendingAction('REGISTER', 'dev-1', 'Sensor 1');
    const failed = markPendingActionFailure([action], action.id, 'server error')[0];

    expect(failed.attempts).toBe(1);
    expect(failed.lastError).toBe('server error');
    expect(getNextRetryDelay(0)).toBe(0);
    expect(getNextRetryDelay(1)).toBe(4000);
    expect(getNextRetryDelay(10)).toBeLessThanOrEqual(30000);
  });
});
