import { openDB } from 'idb';
import { env } from '../config';

async function openIndexedDB(dbName: string, storeName: string) {
  console.log('getFromIndexedDB', env.CLIENT)
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
  console.log('getFromIndexedDB', env.CLIENT)
  if (!env.CLIENT) {
    return;
  }

  const db = await openIndexedDB(dbName, storeName);
  if (db) {
    return db.get(storeName, key);
  }
}

export async function setToIndexedDB(dbName: string, storeName: string, key: string, value: any) {
  console.log('setToIndexedDB', env.CLIENT)
  if (!env.CLIENT) {
    return;
  }

  const db = await openIndexedDB(dbName, storeName);
  if (db) {
    return db.put(storeName, value, key);
  }
}
