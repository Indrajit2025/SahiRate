import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db/dexie";
import { useTranslation } from "@/i18n";

export default function TransactionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handover = useLiveQuery(() => (id ? db.handovers.get(id) : undefined), [id]);
  const lot = useLiveQuery(
    () => (handover ? db.lots.get(handover.lot_id) : undefined),
    [handover?.lot_id]
  );
  const payment = useLiveQuery(
    () => (id ? db.payments.where("handover_id").equals(id).first() : undefined),
    [id]
  );

  if (handover === undefined) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        {t("common.loading")}
      </div>
    );
  }
  if (!handover) {
    return (
      <div className="p-8 text-center flex flex-col items-center gap-4">
        <h2 className="text-xl font-bold text-charcoal">
          {t("recycler.transaction_detail.not_found")}
        </h2>
        <Button variant="outline" onClick={() => navigate("/recycler/transactions")}>
          {t("recycler.transaction_detail.back")}
        </Button>
      </div>
    );
  }

  const material =
    lot?.recycler_verified_material ||
    lot?.payload.material_id ||
    t("common.unknown_material");
  const isPaid = !!payment;
  const isCompleted = handover.status === "COMPLETED";
  const shortLotId = handover.lot_id.substring(0, 8).toUpperCase();

  return (
    <div className="flex flex-col min-h-full bg-[#F7F5EE] pb-8 animate-in fade-in slide-in-from-right-4">
      {/* HEADER */}
      <header className="flex items-center px-4 h-14 border-b border-warm-borders/50 bg-[#F7F5EE] sticky top-0 z-10">
        <button
          onClick={() => navigate("/recycler/transactions")}
          className="mr-3 text-muted-foreground hover:text-charcoal -ml-1 p-1"
          aria-label={t("common.back")}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="font-extrabold text-charcoal text-lg">
          {t("recycler.transaction_detail.title")}
        </h1>
      </header>

      <div className="p-4 space-y-5">
        {/* SETTLEMENT HEADER */}
        {isPaid && (
          <div className="flex flex-col items-center py-5 bg-[#FDFCF8] border-t-[4px] border-t-primary border border-[#E8E4D9] rounded text-center gap-2">
            <CheckCircle2 className="w-10 h-10 text-primary" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-primary">
              {t("recycler.transaction_detail.settlement_complete")}
            </p>
            <p className="text-3xl font-extrabold text-primary font-mono tabular-nums">
              ₹{handover.final_amount?.toLocaleString() ?? "—"}
            </p>
          </div>
        )}

        {/* STATUS if not completed */}
        {!isPaid && (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded px-4 py-3">
            <Clock className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="text-sm font-bold text-amber-800">
              {handover.status === "COMPLETED"
                ? t("status.completed")
                : t("status.pending")}
            </span>
          </div>
        )}

        {/* TRANSACTION DETAILS — physical record style */}
        <section>
          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
            TRANSACTION RECORD
          </p>
          <div className="bg-[#FDFCF8] border border-[#E8E4D9] rounded divide-y divide-dashed divide-[#E8E4D9]">
            <DetailRow label={t("recycler.transaction_detail.lot_id")} value={`#${shortLotId}`} />
            <DetailRow label={t("recycler.transaction_detail.material")} value={(material || "Unknown").toUpperCase()} bold />
            {lot?.payload.approx_weight_kg && (
              <DetailRow
                label={t("recycler.transaction_detail.collector_weight")}
                value={`${lot.payload.approx_weight_kg} kg`}
              />
            )}
            {handover.verified_weight_kg && (
              <DetailRow
                label={t("recycler.transaction_detail.verified_weight")}
                value={`${handover.verified_weight_kg} kg`}
                bold
              />
            )}
            {handover.final_rate && (
              <DetailRow
                label={t("recycler.transaction_detail.rate")}
                value={`₹${handover.final_rate}/kg`}
              />
            )}
            {handover.final_amount && (
              <DetailRow
                label={t("recycler.transaction_detail.amount")}
                value={`₹${handover.final_amount.toLocaleString()}`}
                highlight
              />
            )}
            {payment && (
              <>
                <DetailRow
                  label={t("recycler.transaction_detail.payment_mode")}
                  value={payment.payment_mode}
                />
                {payment.paid_at && (
                  <DetailRow
                    label={t("recycler.transaction_detail.payment_time")}
                    value={new Date(payment.paid_at).toLocaleString()}
                  />
                )}
              </>
            )}
          </div>
        </section>

        {/* TIMELINE */}
        <section>
          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-3">
            {t("recycler.transaction_detail.timeline")}
          </p>
          <div className="space-y-0">
            <TimelineItem
              label={t("recycler.transaction_detail.lot_created")}
              timestamp={lot?.created_at_local}
              done={!!lot?.created_at_local}
            />
            <TimelineItem
              label={t("recycler.transaction_detail.accepted_by_recycler")}
              timestamp={lot?.accepted_at}
              done={!!lot?.accepted_at}
            />
            <TimelineItem
              label={t("recycler.transaction_detail.handover_created")}
              timestamp={handover.created_at_local}
              done={!!handover.created_at_local}
            />
            <TimelineItem
              label={t("recycler.transaction_detail.collector_confirmed")}
              timestamp={handover.collector_confirmed_at}
              done={!!handover.collector_confirmed_at}
            />
            <TimelineItem
              label={t("recycler.transaction_detail.completed")}
              timestamp={handover.completed_at}
              done={!!handover.completed_at}
            />
            <TimelineItem
              label={t("recycler.transaction_detail.payment_recorded")}
              timestamp={payment?.paid_at}
              done={!!payment?.paid_at}
              last
            />
          </div>
        </section>

        <Button
          variant="outline"
          className="w-full h-12 font-bold"
          onClick={() => navigate("/recycler/transactions")}
        >
          {t("recycler.transaction_detail.back")}
        </Button>
      </div>
    </div>
  );
}

// ─── helpers ──────────────────────────────────────────────────────────────────

function DetailRow({
  label,
  value,
  bold,
  highlight,
}: {
  label: string;
  value: string;
  bold?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className="flex justify-between items-center px-4 py-3">
      <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest shrink-0">
        {label}
      </span>
      <span
        className={`text-sm font-mono ml-4 text-right ${
          highlight
            ? "text-lg font-extrabold text-primary"
            : bold
            ? "font-extrabold text-charcoal"
            : "font-bold text-charcoal"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function TimelineItem({
  label,
  timestamp,
  done,
  last,
}: {
  label: string;
  timestamp?: string;
  done: boolean;
  last?: boolean;
}) {
  return (
    <div className="flex gap-3">
      {/* Dot + line */}
      <div className="flex flex-col items-center">
        <div
          className={`w-4 h-4 rounded-full border-2 shrink-0 mt-0.5 ${
            done
              ? "bg-primary border-primary"
              : "bg-white border-[#DDD8CC]"
          }`}
        />
        {!last && (
          <div className="w-0.5 flex-1 bg-[#E8E4D9] my-1" />
        )}
      </div>
      {/* Content */}
      <div className={`pb-4 ${last ? "pb-0" : ""}`}>
        <p className={`text-sm font-bold ${done ? "text-charcoal" : "text-muted-foreground"}`}>
          {label}
        </p>
        {timestamp && (
          <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">
            {new Date(timestamp).toLocaleString()}
          </p>
        )}
      </div>
    </div>
  );
}
