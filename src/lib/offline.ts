import localforage from 'localforage';

// Configure localforage
localforage.config({
  name: 'MinisTreeTracker',
  storeName: 'offline_cache'
});

export interface OutboxItem {
  id: string;
  table: string;
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  payload: any;
  timestamp: number;
}

const OUTBOX_KEY = 'sync_outbox';

export const offlineStore = {
  // Generic data caching
  async setItem(key: string, value: any) {
    return localforage.setItem(key, value);
  },

  async getItem(key: string) {
    return localforage.getItem(key);
  },

  // Outbox management
  async addToOutbox(item: Omit<OutboxItem, 'id' | 'timestamp'>) {
    const outbox = (await localforage.getItem<OutboxItem[]>(OUTBOX_KEY)) || [];
    const newItem: OutboxItem = {
      ...item,
      id: crypto.randomUUID(),
      timestamp: Date.now()
    };
    outbox.push(newItem);
    await localforage.setItem(OUTBOX_KEY, outbox);
    return newItem;
  },

  async getOutbox() {
    return (await localforage.getItem<OutboxItem[]>(OUTBOX_KEY)) || [];
  },

  async clearOutbox() {
    await localforage.setItem(OUTBOX_KEY, []);
  },

  async removeFromOutbox(id: string) {
    const outbox = (await localforage.getItem<OutboxItem[]>(OUTBOX_KEY)) || [];
    const filtered = outbox.filter(item => item.id !== id);
    await localforage.setItem(OUTBOX_KEY, filtered);
  }
};
