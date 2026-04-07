type StorageBackend = {
  getString: (key: string) => string | undefined;
  set: (key: string, value: string) => void;
  delete: (key: string) => void;
};

const memoryStorage = new Map<string, string>();

function createStorageBackend(): StorageBackend {
  try {
    const {MMKV} = require('react-native-mmkv');
    const instance = new MMKV({id: 'ble-device-manager'});

    return {
      getString: (key: string) => instance.getString(key),
      set: (key: string, value: string) => instance.set(key, value),
      delete: (key: string) => instance.delete(key),
    };
  } catch {
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
