import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Clock, Inbox, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db/dexie";
import { useTranslation } from "@/i18n";


export default function History() { const { t } = useTranslation();
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

    if (payment) return { label: t("status.paid") || "PAID", type: "PAID", color: "text-success border-success bg-success/10" };
    if (handover && handover.status === "COMPLETED") return { label: t("status.pending") || "PENDING", type: "COMPLETED", color: "text-blue-700 border-blue-200 bg-blue-50" };
    if (handover) return { label: t("status.pending") || "PENDING", type: "PENDING", color: "text-amber-700 border-amber-200 bg-amber-50" };
    if (lot?.status === "accepted") return { label: t("status.accepted") || "ACCEPTED", type: "PENDING", color: "text-purple-700 border-purple-200 bg-purple-50" };
    return { label: t("status.available") || "AVAILABLE", type: "PENDING", color: "text-charcoal border-warm-borders bg-surface" };
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
          className="mr-4 text-muted-foreground hover:text-charcoal"
          aria-label={t("common.go_back_dashboard") || "Back"}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-charcoal">{t("collector.nav.collections") || "Collections"}</h1>
        </div>
      </header>

      <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-hide">
        {(["ALL", "PENDING", "COMPLETED", "PAID"] as const).map((f) => (
          <button
            key={f}
            type="button"
            className={`whitespace-nowrap px-4 py-2 text-[11px] uppercase tracking-widest rounded-full font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
              filter === f
                ? "bg-charcoal text-white shadow-sm"
                : "border border-warm-borders bg-white hover:bg-surface text-muted-foreground"
            }`}
            onClick={() => setFilter(f)}
            aria-pressed={filter === f}
          >
            {f === "ALL" ? t("collector.history.filter_all") || "ALL" : f === "PENDING" ? t("collector.history.filter_pending") || "PENDING" : f === "COMPLETED" ? t("collector.history.filter_completed") || "COMPLETED" : t("status.paid") || "PAID"}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredLots.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed rounded-xl border-warm-borders bg-surface mt-4">
            <Inbox className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <h3 className="font-bold text-lg text-charcoal">{t("collector.history.no_history") || "No collections found"}</h3>
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
                className="cursor-pointer border-warm-borders bg-[#FAF8F3] hover:bg-warm-borders/40 transition-colors shadow-sm rounded-xl overflow-hidden"
                onClick={() => navigate(`/collector/history/${lot.id}`)}
              >
                <CardContent className="p-0">
                  <div className="flex border-b border-dashed border-[#CBC5B4]">
                    <div className="p-4 flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-extrabold text-charcoal text-lg">
                          {t(`material.${lot.payload.material_id}` as any) || lot.payload.material_id}
                        </h3>
                        <span className="font-extrabold text-charcoal text-lg font-mono">
                          ₹{displayAmount}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm font-medium text-muted-foreground">
                        <span>{displayWeight} kg</span>
                        <span>{new Date(lot.created_at_local).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-3 flex justify-between items-center px-4">
                    <span className={`px-2 py-1 border rounded text-[9px] font-bold uppercase tracking-widest ${status.color}`}>
                      {status.label}
                    </span>
                    <div className="flex items-center gap-2">
                      {isPendingSync && (
                        <span className="text-[10px] uppercase font-bold text-amber-600 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> PENDING SYNC
                        </span>
                      )}
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    </div>
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
