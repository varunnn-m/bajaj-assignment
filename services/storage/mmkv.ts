type StorageBackend = {
  getString: (key: string) => string | undefined;
  set: (key: string, value: string) => void;
  delete: (key: string) => void;
};

const memoryStorage = new Map<string, string>();

function createMemoryStorageBackend(): StorageBackend {
  return {
    getString: (key: string) => memoryStorage.get(key),
    set: (key: string, value: string) => {
      memoryStorage.set(key, value);
    },
    delete: (key: string) => {
      memoryStorage.delete(key);
    },
  };
}

function createStorageBackend(): StorageBackend {
  try {
    const {createMMKV} = require('react-native-mmkv');

    if (typeof createMMKV !== 'function') {
      throw new Error('react-native-mmkv createMMKV API is unavailable.');
    }

    const instance = createMMKV({id: 'ble-device-manager'});

    return {
      getString: (key: string) => instance.getString(key),
      set: (key: string, value: string) => instance.set(key, value),
      delete: (key: string) => instance.delete(key),
    };
  } catch (error) {
    const isJestEnvironment =
      typeof globalThis !== 'undefined' &&
      'jest' in globalThis &&
      Boolean((globalThis as {jest?: unknown}).jest);

    if (isJestEnvironment) {
      return createMemoryStorageBackend();
    }

    const message = error instanceof Error ? error.message : String(error);
    console.error(`MMKV initialization failed: ${message}`);
    throw error;
  }
}

const backend = createStorageBackend();

export const zustandStorage = {
  getItem: (name: string) => backend.getString(name) ?? null,
  setItem: (name: string, value: string) => {
    backend.set(name, value);
  },
  removeItem: (name: string) => {
    backend.delete(name);
  },
};
