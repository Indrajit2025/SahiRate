import { Link, useLocation } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { Cloud, CloudOff, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { db } from '@/db/dexie';
import { useSyncStore } from '@/stores/syncStore';
import { useTranslation } from '@/i18n';

export default function SyncIndicator() {
  const { isOnline, isSyncing } = useSyncStore();
  const location = useLocation();
  const { t } = useTranslation();
  
  const isPublic = ['/', '/scan', '/rates', '/access'].includes(location.pathname);
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
    return null;
  }

  // PUBLIC EXPERIENCE TREATMENT
  if (isPublic) {
    if (!isOnline) {
      return (
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-600/80 bg-white/50 backdrop-blur-sm px-2 py-1 rounded-full uppercase tracking-widest border border-amber-200/50 shadow-sm mt-1">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          <span>Offline</span>
        </div>
      );
    }
    
    if (hasFailed) {
      return (
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-destructive/90 bg-white/80 backdrop-blur-sm px-2 py-1 rounded-full uppercase tracking-widest border border-destructive/20 shadow-sm mt-1">
          <span>! Sync needs attention</span>
        </div>
      );
    }

    if (isSyncing) {
      return (
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-primary/80 bg-white/50 backdrop-blur-sm px-2 py-1 rounded-full uppercase tracking-widest border border-primary/20 shadow-sm mt-1">
          <RefreshCw className="w-2.5 h-2.5 animate-spin" />
          <span>Syncing...</span>
        </div>
      );
    }

    if (unsyncedCount && unsyncedCount > 0) {
      return (
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-charcoal/70 bg-white/50 backdrop-blur-sm px-2 py-1 rounded-full uppercase tracking-widest border border-warm-borders shadow-sm mt-1">
          <RefreshCw className="w-2.5 h-2.5" />
          <span>{unsyncedCount} pending</span>
        </div>
      );
    }

    // Healthy (Ready offline)
    return (
      <div className="flex items-center gap-1.5 text-[10px] font-bold text-success/60 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full uppercase tracking-widest border border-success/10 mt-1 opacity-0 hover:opacity-100 transition-opacity">
        <CheckCircle2 className="w-2.5 h-2.5" />
        <span>Ready offline</span>
      </div>
    );
  }

  // COLLECTOR / RECYCLER / ADMIN ORIGINAL TREATMENT
  if (!isOnline) {
    return (
      <Link to={syncPath} className="flex items-center gap-2 text-xs font-medium text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200 shadow-sm transition-all hover:bg-amber-100">
        <CloudOff className="w-4 h-4" />
        <span>{t("common.offline")} ({unsyncedCount || 0})</span>
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
      <span>{t("common.synced")}</span>
    </Link>
  );
}
