import { openDB } from 'idb';

async function openIndexedDB(dbName: string, storeName: string) {
  const db = await openDB(dbName, 1, {
    upgrade(db: any) {
      if (!db.objectStoreNames.contains(storeName))
        db.createObjectStore(storeName);
    },
  });
  return db;
}

export async function getFromIndexedDB(
  dbName: string,
  storeName: string,
  key: string
) {
  const db = await openIndexedDB(dbName, storeName);
  return db.get(storeName, key);
}

export async function setToIndexedDB(
  dbName: string,
  storeName: string,
  key: string,
  value: any
) {
  const db = await openIndexedDB(dbName, storeName);
  return db.put(storeName, value, key);
}
