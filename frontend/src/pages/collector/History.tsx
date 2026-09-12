import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Clock, Inbox } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db/dexie";
import { useI18nStore } from "@/i18n";


export default function History() { const { t } = useI18nStore();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "COMPLETED" | "PAID">("ALL");

  const lots = useLiveQuery(() => db.lots.orderBy("created_at_local").reverse().toArray(), []) || [];
  const handovers = useLiveQuery(() => db.handovers.toArray(), []) || [];
  const payments = useLiveQuery(() => db.payments.toArray(), []) || [];
  const outboxEvents = useLiveQuery(() => db.outbox.toArray(), []) || [];

  const getDerivedStatus = (lotId: string) => {
    const handover = handovers.find((h) => h.lot_id === lotId);
    const payment = handover ? payments.find((p) => p.handover_id === handover.id) : null;
    const lot = lots.find((l) => l.id === lotId);

    if (payment) return { label: t("status.paid"), type: "PAID", color: "bg-green-100 text-green-800 border-green-200" };
    if (handover && handover.status === "COMPLETED") return { label: t("status.pending"), type: "COMPLETED", color: "bg-blue-100 text-blue-800 border-blue-200" };
    if (handover) return { label: t("status.pending"), type: "PENDING", color: "bg-amber-100 text-amber-800 border-amber-200" };
    if (lot?.status === "accepted") return { label: t("status.accepted"), type: "PENDING", color: "bg-purple-100 text-purple-800 border-purple-200" };
    return { label: t("status.available"), type: "PENDING", color: "bg-slate-100 text-slate-800 border-slate-200" };
  };

  const filteredLots = lots.filter((lot) => {
    if (filter === "ALL") return true;
    const status = getDerivedStatus(lot.id);
    return status.type === filter;
  });

  return (
    <div className="flex flex-col min-h-screen p-4 pb-24 space-y-6 animate-in fade-in slide-in-from-right-4">
      <header className="flex items-center py-4">
        <button
          onClick={() => navigate("/collector")}
          className="mr-4 text-muted-foreground hover:text-foreground"
          aria-label={t("common.go_back_dashboard")}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-2xl font-bold">{t("collector.history.title")}</h1>

        </div>
      </header>

      <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-hide">
        {(["ALL", "PENDING", "COMPLETED", "PAID"] as const).map((f) => (
          <button
            key={f}
            type="button"
            className={`whitespace-nowrap px-4 py-2 text-sm rounded-full font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
              filter === f
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "border border-input bg-background hover:bg-accent hover:text-accent-foreground"
            }`}
            onClick={() => setFilter(f)}
            aria-pressed={filter === f}
          >
            {f === "ALL" ? t("collector.history.filter_all") : f === "PENDING" ? t("collector.history.filter_pending") : f === "COMPLETED" ? t("collector.history.filter_completed") : t("status.paid")}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredLots.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed rounded-xl border-muted">
            <Inbox className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <h3 className="font-semibold text-lg">{t("collector.history.no_history")}</h3>

          </div>
        ) : (
          filteredLots.map((lot) => {
            const handover = handovers.find((h) => h.lot_id === lot.id);
            const payment = handover ? payments.find((p) => p.handover_id === handover.id) : null;
            const status = getDerivedStatus(lot.id);

            const isPendingSync = lot.sync_status !== "synced" || outboxEvents.some((e: any) =>
              e.sync_status !== "synced" && (e.payload?.lot_id === lot.id || (handover && e.payload?.handover_id === handover.id))
            );

            const displayWeight = handover?.verified_weight_kg || lot.payload.approx_weight_kg || "—";
            const displayAmount = payment?.amount || handover?.final_amount || lot.payload.estimated_value || "—";

            return (
              <Card
                key={lot.id}
                className="cursor-pointer hover:bg-muted/50 transition-colors shadow-sm"
                onClick={() => navigate(`/collector/history/${lot.id}`)}
              >
                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg">{t(`material.${lot.payload.material_id}` as any) || t("common.unknown_material")}</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        {new Date(lot.created_at_local).toLocaleDateString()} • {displayWeight} kg
                      </p>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <span className="font-bold text-lg flex items-center">
                        ₹{displayAmount}
                      </span>
                      {isPendingSync && (
                        <span className="text-[10px] uppercase font-bold text-amber-600 flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3" /> {t("status.pending_sync")}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-muted">
                    <Badge variant="outline" className={`${status.color} font-semibold uppercase text-[10px]`}>
                      {status.label}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
