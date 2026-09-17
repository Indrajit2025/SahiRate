import { useNavigate } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { ArrowLeft, RefreshCw, AlertTriangle, CheckCircle2, Clock, Bug, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { db } from "@/db/dexie";
import { processOutbox } from "@/services/syncManager";
import { useSyncStore } from "@/stores/syncStore";
import { useTranslation } from "@/i18n";

export default function SyncCenter() { const { t } = useTranslation();
  const navigate = useNavigate();
  const { isSyncing, isOnline, failNextSync, setFailNextSync } = useSyncStore();

  const outboxEvents = useLiveQuery(() => db.outbox.orderBy('created_at_local').reverse().toArray(), []) || [];
  
  const pendingCount = outboxEvents.filter(e => e.sync_status === 'pending' || e.sync_status === 'failed').length;

  return (
    <div className="flex flex-col min-h-screen p-4 pb-20 space-y-6 animate-in fade-in slide-in-from-right-4 bg-background">
      <header className="flex items-center py-4">
        <button
          onClick={() => navigate("/collector")}
          className="mr-4 text-muted-foreground hover:text-charcoal"
          aria-label={t("common.go_back_dashboard") || "Back"}
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-extrabold text-charcoal tracking-tight">{t("collector.sync_center.title") || "Sync Center"}</h1>
      </header>

      <Card className={`border shadow-sm rounded-2xl ${isOnline ? 'bg-surface border-warm-borders' : 'bg-red-50 border-red-200'}`}>
        <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-4">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center ${isOnline ? 'bg-primary/10 text-primary' : 'bg-red-100 text-red-600'}`}>
            {isOnline ? <Wifi className="w-8 h-8" /> : <WifiOff className="w-8 h-8" />}
          </div>
          <div>
            <h2 className="font-extrabold text-charcoal text-lg">
              {isOnline ? t("common.online") : t("common.offline")}
            </h2>
            <p className="text-sm font-medium text-muted-foreground mt-1">
              {isOnline 
                ? (pendingCount > 0 ? `${pendingCount} ${t("collector.sync_center.sync_now")}` : t("collector.sync_center.all_synced"))
                : t("collector.sync_center.offline_mode")}
            </p>
          </div>
          
          <Button
            size="lg"
            className="w-full h-12 font-bold uppercase tracking-widest text-sm rounded-xl mt-2"
            disabled={!isOnline || isSyncing || pendingCount === 0}
            onClick={() => processOutbox()}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? "animate-spin" : ""}`} />
            {isSyncing ? t("collector.sync_center.syncing") || "SYNCING..." : t("collector.sync_center.sync_now") || "SYNC NOW"}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-dashed border-2 bg-muted/20 border-warm-borders rounded-xl shadow-none">
        <CardContent className="p-4 flex flex-col gap-3">
          <h3 className="font-bold flex items-center gap-2 text-charcoal text-sm uppercase tracking-widest">
            <Bug className="w-4 h-4 text-muted-foreground" />
            Developer Controls
          </h3>
          <p className="text-[11px] font-medium text-muted-foreground leading-relaxed">
            Toggle this switch to deterministically fail the next sync attempt (e.g. simulating a 500 server error).
          </p>
          <Button
            variant={failNextSync ? "destructive" : "secondary"}
            className="w-full h-10 font-bold"
            onClick={() => setFailNextSync(!failNextSync)}
          >
            {failNextSync ? "Next Sync WILL FAIL" : "Fail Next Sync: OFF"}
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-3 pt-2">
        <h3 className="font-bold text-[11px] text-muted-foreground uppercase tracking-widest px-2">
          Sync Queue
        </h3>
        
        {outboxEvents.length === 0 && (
          <div className="flex flex-col items-center justify-center p-8 text-center border-2 border-dashed rounded-xl border-warm-borders bg-surface">
            <h3 className="font-bold text-muted-foreground">Queue is empty</h3>
          </div>
        )}
        
        {outboxEvents.map(event => (
          <Card key={event.id} className={`rounded-xl shadow-sm border-warm-borders ${event.sync_status === 'failed' ? 'border-red-300 bg-red-50' : 'bg-white'}`}>
            <CardContent className="p-4 flex flex-col gap-2">
              <div className="flex justify-between items-start">
                <span className="font-bold text-[10px] text-primary uppercase tracking-widest bg-primary/10 px-2 py-1 rounded">
                  {event.type.replace("sahirate.", "")}
                </span>
                
                {event.sync_status === 'synced' && <span className="text-[10px] font-bold uppercase tracking-widest text-success flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Synced</span>}
                {event.sync_status === 'pending' && <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3"/> Pending</span>}
                {event.sync_status === 'syncing' && <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 flex items-center gap-1"><RefreshCw className="w-3 h-3 animate-spin"/> Syncing</span>}
                {event.sync_status === 'failed' && <span className="text-[10px] font-bold uppercase tracking-widest text-red-600 flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> Failed</span>}
              </div>
              <p className="text-xs font-mono font-bold text-charcoal mt-1 truncate" title={event.id}>ID: {event.id}</p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Local: {new Date(event.created_at_local).toLocaleString()}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
