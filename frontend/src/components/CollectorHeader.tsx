import LanguageSelector from "./LanguageSelector";
import AudioToggle from "./AudioToggle";
import { useSyncStore } from "@/stores/syncStore";
import { Check, CloudOff, RefreshCw, AlertTriangle } from "lucide-react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db/dexie";
import { Link } from "react-router-dom";

export default function CollectorHeader() {
  const { isOnline, isSyncing } = useSyncStore();

  const pendingCount = useLiveQuery(
    () => db.outbox.where('sync_status').anyOf('pending', 'failed', 'syncing').count(),
    []
  ) || 0;

  return (
    <header className="flex justify-between items-center px-3 h-14 bg-background shrink-0 sticky top-0 z-10 border-b border-warm-borders/50">
      
      {/* LOGO */}
      <Link to="/collector" className="flex items-center">
        <span className="font-extrabold text-xl tracking-tight leading-none" style={{ color: "#174C4A" }}>Sahi</span>
        <span className="font-extrabold text-xl tracking-tight leading-none" style={{ color: "#C56A3D" }}>Rate</span>
      </Link>

      <div className="flex items-center gap-1 sm:gap-2">
        {/* SYNC STATUS */}
        <div className="text-[9px] font-bold uppercase tracking-widest flex items-center">
          {isSyncing ? (
            <span className="text-primary flex items-center gap-0.5 bg-primary/10 px-1 py-0.5 rounded">
              <RefreshCw className="w-3 h-3 animate-spin" /> SYNCING
            </span>
          ) : !isOnline ? (
            <span className="text-muted-foreground flex items-center gap-0.5 bg-surface px-1 py-0.5 rounded border border-warm-borders">
              <CloudOff className="w-3 h-3" /> OFFLINE
            </span>
          ) : pendingCount > 0 ? (
            <span className="text-amber-600 flex items-center gap-0.5 bg-amber-50 px-1 py-0.5 rounded border border-amber-200">
              <AlertTriangle className="w-3 h-3" /> {pendingCount}
            </span>
          ) : (
            <span className="text-success flex items-center gap-0.5 bg-success/10 px-1 py-0.5 rounded">
              <Check className="w-3 h-3" /> SYNCED
            </span>
          )}
        </div>
        
        <AudioToggle />
        <LanguageSelector />
      </div>
    </header>
  );
}
