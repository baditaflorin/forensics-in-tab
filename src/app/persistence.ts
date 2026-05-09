import { defaultSettings, type AppSettings, type SessionState, serializeSession } from './session';

const databaseName = 'forensics-in-tab';
const databaseVersion = 1;
const storeName = 'kv';
const sessionKey = 'current-session';
const settingsKey = 'app-settings';
const tabKey = 'last-tab';

type DatabaseHandle = IDBDatabase;

function openDatabase(): Promise<DatabaseHandle> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(databaseName, databaseVersion);

    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(storeName)) {
        database.createObjectStore(storeName);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('IndexedDB could not be opened.'));
  });
}

function withStore<T>(
  mode: IDBTransactionMode,
  action: (store: IDBObjectStore, done: (value: T) => void, fail: (error: Error) => void) => void
): Promise<T> {
  return openDatabase().then(
    (database) =>
      new Promise<T>((resolve, reject) => {
        const transaction = database.transaction(storeName, mode);
        const store = transaction.objectStore(storeName);
        action(
          store,
          (value) => resolve(value),
          (error) => reject(error)
        );
        transaction.oncomplete = () => database.close();
        transaction.onerror = () =>
          reject(transaction.error ?? new Error('IndexedDB transaction failed.'));
      })
  );
}

export async function saveSessionSnapshot(state: SessionState): Promise<void> {
  const serialized = JSON.stringify(serializeSession(state));

  await withStore<void>('readwrite', (store, done, fail) => {
    const request = store.put(serialized, sessionKey);
    request.onsuccess = () => done(undefined);
    request.onerror = () => fail(request.error ?? new Error('Session could not be saved.'));
  });
}

export async function loadSessionSnapshot(): Promise<string | null> {
  return withStore<string | null>('readonly', (store, done, fail) => {
    const request = store.get(sessionKey);
    request.onsuccess = () => done(typeof request.result === 'string' ? request.result : null);
    request.onerror = () => fail(request.error ?? new Error('Session could not be loaded.'));
  });
}

export async function clearSessionSnapshot(): Promise<void> {
  await withStore<void>('readwrite', (store, done, fail) => {
    const request = store.delete(sessionKey);
    request.onsuccess = () => done(undefined);
    request.onerror = () => fail(request.error ?? new Error('Session could not be cleared.'));
  });
}

export function loadSettings(): AppSettings {
  const raw = window.localStorage.getItem(settingsKey);
  if (!raw) {
    return defaultSettings;
  }

  try {
    return { ...defaultSettings, ...JSON.parse(raw) };
  } catch {
    return defaultSettings;
  }
}

export function saveSettings(settings: AppSettings) {
  window.localStorage.setItem(settingsKey, JSON.stringify(settings));
}

export function loadLastTab(): string | null {
  return window.localStorage.getItem(tabKey);
}

export function saveLastTab(tab: string) {
  window.localStorage.setItem(tabKey, tab);
}
