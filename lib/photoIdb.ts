export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('CampInventoryPhotosDB', 1);
    request.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('photos')) {
        db.createObjectStore('photos');
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const savePhoto = async (key: string, base64: string): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('photos', 'readwrite');
    const store = tx.objectStore('photos');
    store.put(base64, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};

export const loadPhoto = async (key: string): Promise<string | null> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('photos', 'readonly');
    const store = tx.objectStore('photos');
    const request = store.get(key);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(tx.error);
  });
};

export const deletePhoto = async (key: string): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('photos', 'readwrite');
    const store = tx.objectStore('photos');
    store.delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};

export const loadAllPhotos = async (): Promise<Record<string, string>> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('photos', 'readonly');
    const store = tx.objectStore('photos');
    const request = store.getAll();
    const keysRequest = store.getAllKeys();
    
    tx.oncomplete = () => {
      const result: Record<string, string> = {};
      const keys = keysRequest.result;
      const values = request.result;
      keys.forEach((key, i) => {
        result[key as string] = values[i];
      });
      resolve(result);
    };
    tx.onerror = () => reject(tx.error);
  });
};
