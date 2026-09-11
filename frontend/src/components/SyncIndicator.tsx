import { Link, useLocation } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { Cloud, CloudOff, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { db } from '@/db/dexie';
import { useSyncStore } from '@/stores/syncStore';

export default function SyncIndicator() {
  const { isOnline, isSyncing } = useSyncStore();
  const location = useLocation();
  const syncPath = location.pathname.startsWith('/recycler') ? '/recycler/sync' : '/collector/sync';

  // Reactively count how many events are not synced
  const unsyncedCount = useLiveQuery(
    () => db.outbox.where('sync_status').anyOf('pending', 'failed', 'syncing').count(),
    []
  );

  const hasFailed = useLiveQuery(
    () => db.outbox.where('sync_status').equals('failed').count().then(c => c > 0),
    []
  );

  if (unsyncedCount === undefined || hasFailed === undefined) {
    // Avoid falsely showing "Synced" while the IndexedDB query is still resolving
    return null;
  }

  if (!isOnline) {
    return (
      <Link to={syncPath} className="flex items-center gap-2 text-xs font-medium text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200 shadow-sm transition-all hover:bg-amber-100">
        <CloudOff className="w-4 h-4" />
        <span>Offline ({unsyncedCount || 0})</span>
      </Link>
    );
  }

  if (isSyncing) {
    return (
      <Link to={syncPath} className="flex items-center gap-2 text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-200 shadow-sm transition-all hover:bg-blue-100">
        <RefreshCw className="w-4 h-4 animate-spin" />
        <span>Syncing...</span>
      </Link>
    );
  }

  if (hasFailed) {
    return (
      <Link to={syncPath} className="flex items-center gap-2 text-xs font-medium text-destructive bg-destructive/10 px-3 py-1.5 rounded-full border border-destructive/20 shadow-sm transition-all hover:bg-destructive/20">
        <AlertCircle className="w-4 h-4" />
        <span>Sync Failed</span>
      </Link>
    );
  }

  if (unsyncedCount && unsyncedCount > 0) {
    return (
      <Link to={syncPath} className="flex items-center gap-2 text-xs font-medium text-slate-600 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200 shadow-sm transition-all hover:bg-slate-100">
        <Cloud className="w-4 h-4" />
        <span>{unsyncedCount} Pending</span>
      </Link>
    );
  }

  // Fully synced
  return (
    <Link to={syncPath} className="flex items-center gap-2 text-xs font-medium text-green-600 bg-green-50 px-3 py-1.5 rounded-full border border-green-200 shadow-sm transition-all hover:bg-green-100 opacity-70 hover:opacity-100">
      <CheckCircle2 className="w-4 h-4" />
      <span>Synced</span>
    </Link>
  );
}
