import { STORAGE_KEY, emptyState, migrate, CURRENT_SCHEMA_VERSION } from './schema.js';

const IDB_NAME = 'afp:images';
const IDB_STORE = 'images';
const IDB_VERSION = 1;

// ── localStorage ────────────────────────────────────────────────────────────

/** Load and return state from localStorage, migrating if needed. */
export function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw);
    if (parsed.schemaVersion !== CURRENT_SCHEMA_VERSION) {
      return migrate(parsed);
    }
    return parsed;
  } catch (e) {
    console.error('db.load failed, returning empty state', e);
    return emptyState();
  }
}

/** Persist the entire state to localStorage. */
export function save(state) {
  try {
    const updated = { ...state, meta: { ...state.meta, updatedAt: new Date().toISOString() } };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('db.save failed', e);
    throw e;
  }
}

/** Wipe localStorage and return a fresh empty state. */
export function reset() {
  localStorage.removeItem(STORAGE_KEY);
  return emptyState();
}

// ── IndexedDB (images) ───────────────────────────────────────────────────────

let _db = null;

function openIDB() {
  if (_db) return Promise.resolve(_db);
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, IDB_VERSION);
    req.onupgradeneeded = e => {
      e.target.result.createObjectStore(IDB_STORE);
    };
    req.onsuccess = e => { _db = e.target.result; resolve(_db); };
    req.onerror = e => reject(e.target.error);
  });
}

export async function saveImage(id, blob) {
  const db = await openIDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readwrite');
    tx.objectStore(IDB_STORE).put(blob, id);
    tx.oncomplete = resolve;
    tx.onerror = e => reject(e.target.error);
  });
}

export async function getImage(id) {
  const db = await openIDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readonly');
    const req = tx.objectStore(IDB_STORE).get(id);
    req.onsuccess = e => resolve(e.target.result ?? null);
    req.onerror = e => reject(e.target.error);
  });
}

export async function deleteImage(id) {
  const db = await openIDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readwrite');
    tx.objectStore(IDB_STORE).delete(id);
    tx.oncomplete = resolve;
    tx.onerror = e => reject(e.target.error);
  });
}
