import { supabase } from './supabase';
import { offlineStore } from './offline';

let isSyncing = false;

export const syncOfflineData = async () => {
  if (isSyncing || !navigator.onLine) return;
  
  const outbox = await offlineStore.getOutbox();
  if (outbox.length === 0) return;

  isSyncing = true;
  console.log(`[Sync] Starting synchronization of ${outbox.length} items...`);

  for (const item of outbox) {
    try {
      let result;
      
      switch (item.action) {
        case 'INSERT':
          result = await supabase.from(item.table).insert(item.payload);
          break;
        case 'UPDATE':
          // We assume payload includes id for updates
          const { id, ...updateData } = item.payload;
          result = await supabase.from(item.table).update(updateData).eq('id', id);
          break;
        case 'DELETE':
          result = await supabase.from(item.table).delete().eq('id', item.payload.id);
          break;
      }

      if (!result?.error) {
        await offlineStore.removeFromOutbox(item.id);
      } else {
        console.error(`[Sync] Error syncing item ${item.id}:`, result.error);
      }
    } catch (err) {
      console.error(`[Sync] Fatal error syncing item ${item.id}:`, err);
    }
  }

  isSyncing = false;
  console.log('[Sync] Synchronization complete.');
};

// Auto-sync when coming back online
if (typeof window !== 'undefined') {
  window.addEventListener('online', syncOfflineData);
}
