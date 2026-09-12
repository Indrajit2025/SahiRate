import { useNavigate } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { ArrowLeft, RefreshCw, AlertTriangle, CheckCircle2, Clock, Bug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { db } from "@/db/dexie";
import { processOutbox } from "@/services/syncManager";
import { useSyncStore } from "@/stores/syncStore";
import { useI18nStore } from "@/i18n";

export default function SyncCenter() { const { t } = useI18nStore();
  const navigate = useNavigate();
  const { isSyncing, isOnline, failNextSync, setFailNextSync } = useSyncStore();

  const outboxEvents = useLiveQuery(() => db.outbox.orderBy('created_at_local').reverse().toArray(), []) || [];

  return (
    <div className="max-w-md mx-auto p-4 min-h-screen pb-20">
      <header className="flex items-center justify-between py-4 mb-4">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="mr-2">
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <span className="text-lg font-medium">{t("collector.sync_center.title")}</span>
        </div>
        <Button
          size="sm"
          variant={isSyncing ? "outline" : "default"}
          disabled={!isOnline || isSyncing}
          onClick={() => processOutbox()}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? "animate-spin" : ""}`} />
          {isSyncing ? t("collector.sync_center.syncing") : t("collector.sync_center.sync_now")}
        </Button>
      </header>

      <Card className="mb-6 border-dashed border-2 bg-muted/20">
        <CardContent className="p-4 flex flex-col gap-3">
          <h3 className="font-semibold flex items-center gap-2">
            <Bug className="w-4 h-4 text-muted-foreground" />
            Developer Controls
          </h3>
          <p className="text-xs text-muted-foreground">
            Toggle this switch to deterministically fail the next sync attempt (e.g. simulating a 500 server error). The transport currently points to a Mock/Demo transport.
          </p>
          <Button
            variant={failNextSync ? "destructive" : "secondary"}
            className="w-full"
            onClick={() => setFailNextSync(!failNextSync)}
          >
            {failNextSync ? "Next Sync WILL FAIL" : "Fail Next Sync: OFF"}
          </Button>
        </CardContent>
      </Card>

      <h3 className="font-semibold text-lg mb-4">Outbox Queue</h3>
      <div className="space-y-3">
        {outboxEvents.length === 0 && (
          <p className="text-center text-muted-foreground py-8">Queue is empty.</p>
        )}
        {outboxEvents.map(event => (
          <Card key={event.id} className={event.sync_status === 'failed' ? 'border-destructive/50 bg-destructive/5' : ''}>
            <CardContent className="p-4 flex flex-col gap-2">
              <div className="flex justify-between items-start">
                <span className="font-mono text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                  {event.type}
                </span>
                {event.sync_status === 'synced' && <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200"><CheckCircle2 className="w-3 h-3 mr-1"/> Synced</Badge>}
                {event.sync_status === 'pending' && <Badge variant="outline" className="text-slate-600 bg-slate-50"><Clock className="w-3 h-3 mr-1"/> Pending</Badge>}
                {event.sync_status === 'syncing' && <Badge variant="outline" className="text-blue-600 bg-blue-50 border-blue-200"><RefreshCw className="w-3 h-3 mr-1 animate-spin"/> Syncing</Badge>}
                {event.sync_status === 'failed' && <Badge variant="destructive" className="bg-destructive text-destructive-foreground"><AlertTriangle className="w-3 h-3 mr-1"/> Failed</Badge>}
              </div>
              <p className="text-sm font-medium truncate" title={event.id}>ID: {event.id}</p>
              <p className="text-xs text-muted-foreground">Local Time: {new Date(event.created_at_local).toLocaleString()}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
