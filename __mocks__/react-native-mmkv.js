const stores = new Map();

function createMMKV({id = 'default'} = {}) {
  if (!stores.has(id)) {
    stores.set(id, new Map());
  }

  const store = stores.get(id);

  return {
    getString: key => store.get(key),
    set: (key, value) => {
      store.set(key, value);
    },
    delete: key => {
      store.delete(key);
    },
  };
}

module.exports = {
  createMMKV,
};
