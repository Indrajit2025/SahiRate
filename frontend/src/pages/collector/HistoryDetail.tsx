import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Weight, IndianRupee, Clock, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db/dexie";
import { useI18nStore } from "@/i18n";

export default function HistoryDetail() { const { t } = useI18nStore();
  const { lotId } = useParams<{ lotId: string }>();
  const navigate = useNavigate();

  const lot = useLiveQuery(() => (lotId ? db.lots.get(lotId) : undefined), [lotId]);
  const handover = useLiveQuery(() => (lotId ? db.handovers.where("lot_id").equals(lotId).first() : undefined), [lotId]);
  const payment = useLiveQuery(() => (handover ? db.payments.where("handover_id").equals(handover.id).first() : undefined), [handover]);
  const photo = useLiveQuery(() => (lotId ? db.photos.where("lot_id").equals(lotId).first() : undefined), [lotId]);
  const outboxEvents = useLiveQuery(() => db.outbox.toArray(), []) || [];

  if (lot === undefined) return <div className="p-8 text-center text-muted-foreground">{t("common.loading")}</div>;
  if (!lot) return <div className="p-8 text-center font-bold">{t("collector.history_detail.transaction_not_found")}</div>;

  const isPendingSync = lot.sync_status !== "synced" || outboxEvents.some((e: any) =>
    e.sync_status !== "synced" && (e.payload?.lot_id === lot.id || (handover && e.payload?.handover_id === handover.id))
  );

  const displayWeight = handover?.verified_weight_kg || lot.payload.approx_weight_kg || "—";
  const displayAmount = payment?.amount || handover?.final_amount || lot.payload.estimated_value || "—";
  const displayRate = handover?.final_rate || "—";

  return (
    <div className="flex flex-col min-h-screen p-4 pb-24 space-y-6 animate-in fade-in slide-in-from-right-4">
      <header className="flex items-center py-4">
        <button
          onClick={() => navigate("/collector/history")}
          className="mr-4 text-muted-foreground hover:text-foreground"
          aria-label="Go back to History"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold">{t("collector.history_detail.title")}</h1>
      </header>

      {isPendingSync && (
        <div className="bg-amber-100 text-amber-800 border-amber-200 border p-3 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold">
          <Clock className="w-4 h-4" />
          Offline — awaiting sync
        </div>
      )}

      {/* Primary Details */}
      <Card className="shadow-sm">
        <CardContent className="p-0 overflow-hidden">
          {photo?.data_uri ? (
            <div className="w-full h-48 bg-muted">
              <img src={photo.data_uri} alt="Collection" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-full h-12 bg-primary/5"></div>
          )}
          <div className="p-6 space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold">{lot.payload.material_id || t("common.unknown_material")}</h2>
                {handover?.recycler_id && (
                  <p className="text-sm text-muted-foreground mt-1">{t("collector.history_detail.recycler_id")}: {handover.recycler_id}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-muted">
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground flex items-center gap-1"><Weight className="w-4 h-4"/> {t("common.weight")}</span>
                <p className="text-xl font-bold">{displayWeight} kg</p>
              </div>
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground flex items-center gap-1"><IndianRupee className="w-4 h-4"/> {t("common.rate")}</span>
                <p className="text-xl font-bold">₹{displayRate}/kg</p>
              </div>
              <div className="col-span-2 space-y-1 pt-2">
                <span className="text-sm text-muted-foreground">{t("collector.history_detail.final_amount")}</span>
                <p className="text-3xl font-black text-primary">₹{displayAmount}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lifecycle Timeline */}
      <Card className="shadow-sm">
        <CardContent className="p-6 space-y-6">
          <h3 className="font-semibold text-lg">{t("collector.history_detail.timeline")}</h3>

          <div className="relative border-l-2 border-muted ml-3 space-y-6">
            {/* 1. Created */}
            <div className="relative pl-6">
              <div className="absolute -left-[9px] top-1 bg-primary text-primary-foreground rounded-full p-0.5">
                <CheckCircle2 className="w-3 h-3" />
              </div>
              <p className="font-medium">{t("collector.history_detail.lot_created")}</p>
              <p className="text-xs text-muted-foreground">{new Date(lot.created_at_local).toLocaleString()}</p>
            </div>

            {/* 2. Accepted */}
            {lot.status === "accepted" && (
              <div className="relative pl-6">
                <div className="absolute -left-[9px] top-1 bg-primary text-primary-foreground rounded-full p-0.5">
                  <CheckCircle2 className="w-3 h-3" />
                </div>
                <p className="font-medium">{t("collector.history_detail.accepted_by_recycler")}</p>
                {lot.accepted_at && (
                  <p className="text-xs text-muted-foreground">{new Date(lot.accepted_at).toLocaleString()}</p>
                )}
              </div>
            )}

            {/* 3. Verified / QR Generated */}
            {handover && (
              <div className="relative pl-6">
                <div className="absolute -left-[9px] top-1 bg-primary text-primary-foreground rounded-full p-0.5">
                  <CheckCircle2 className="w-3 h-3" />
                </div>
                <p className="font-medium">{t("collector.history_detail.weight_verified")}</p>
                <p className="text-xs text-muted-foreground">{new Date(handover.created_at_local).toLocaleString()}</p>
              </div>
            )}

            {/* 4. Collector Confirmed */}
            {handover?.collector_confirmed_at && (
              <div className="relative pl-6">
                <div className="absolute -left-[9px] top-1 bg-primary text-primary-foreground rounded-full p-0.5">
                  <CheckCircle2 className="w-3 h-3" />
                </div>
                <p className="font-medium">{t("collector.history_detail.collector_confirmed")}</p>
                <p className="text-xs text-muted-foreground">{new Date(handover.collector_confirmed_at).toLocaleString()}</p>
              </div>
            )}

            {/* 5. Completed */}
            {handover?.status === "COMPLETED" && handover.completed_at && (
              <div className="relative pl-6">
                <div className="absolute -left-[9px] top-1 bg-primary text-primary-foreground rounded-full p-0.5">
                  <CheckCircle2 className="w-3 h-3" />
                </div>
                <p className="font-medium">{t("collector.history_detail.handover_completed")}</p>
                <p className="text-xs text-muted-foreground">{new Date(handover.completed_at).toLocaleString()}</p>
              </div>
            )}

            {/* 5. Payment */}
            {payment && payment.paid_at && (
              <div className="relative pl-6">
                <div className="absolute -left-[9px] top-1 bg-green-500 text-white rounded-full p-0.5">
                  <CheckCircle2 className="w-3 h-3" />
                </div>
                <p className="font-medium text-green-700">{t("status.paid")}</p>
                <p className="text-xs text-muted-foreground">{new Date(payment.paid_at).toLocaleString()} via {payment.payment_mode}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {handover?.qr_reference && (
        <div className="text-center pb-4">
          <Badge variant="outline" className="text-xs font-mono text-muted-foreground">
            Ref: {handover.qr_reference}
          </Badge>
        </div>
      )}
    </div>
  );
}
