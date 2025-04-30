import { openDB } from 'idb';
import { env } from 'src/shared/config';

async function openIndexedDB(dbName: string, storeName: string) {
  if (!env.CLIENT) {
    return;
  }

  const db = await openDB(dbName, 1, {
    upgrade(db: any) {
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName);
      }
    },
  });

  return db;
}

export async function getFromIndexedDB(dbName: string, storeName: string, key: string) {
  if (!env.CLIENT) {
    return;
  }

  const db = await openIndexedDB(dbName, storeName);
  if (db) {
    return db.get(storeName, key);
  }
}

export async function setToIndexedDB(dbName: string, storeName: string, key: string, value: any) {
  if (!env.CLIENT) {
    return;
  }

  const db = await openIndexedDB(dbName, storeName);
  if (db) {
    return db.put(storeName, value, key);
  }
}
