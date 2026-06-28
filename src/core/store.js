import { events } from './events.js';

let _state = null;

export const store = {
  /** Initialize store with a full state object */
  init(state) {
    _state = state;
  },

  /** Full state snapshot (read-only reference; do not mutate) */
  getState() {
    return _state;
  },

  /**
   * Update a top-level key. Merges shallow for objects, replaces for arrays.
   * Emits 'change:key' and 'change' after update.
   */
  set(key, value) {
    _state = { ..._state, [key]: value };
    events.emit(`change:${key}`, value);
    events.emit('change', { key, value });
  },

  /** Convenience: update a slice of settings */
  setSetting(key, value) {
    this.set('settings', { ..._state.settings, [key]: value });
  },

  /** Subscribe to a specific top-level key change */
  subscribe(key, fn) {
    return events.on(`change:${key}`, fn);
  },

  /** Subscribe to any change */
  subscribeAll(fn) {
    return events.on('change', fn);
  },
};
