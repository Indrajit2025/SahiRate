import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db/dexie";
import { DEMO_RECYCLER_ID } from "@/services/lots";
import { useTranslation } from "@/i18n";

type Filter = "all" | "completed" | "pending" | "cancelled";

export default function Transactions() {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<Filter>("all");

  // All handovers belonging to this recycler
  const handovers = useLiveQuery(
    () =>
      db.handovers
        .filter((h) => h.recycler_id === DEMO_RECYCLER_ID)
        .toArray()
        .then((arr) =>
          arr.sort(
            (a, b) =>
              new Date(b.created_at_local).getTime() -
              new Date(a.created_at_local).getTime()
          )
        ),
    []
  );

  if (handovers === undefined) {
    return (
      <div className="flex items-center justify-center p-12 text-muted-foreground">
        {t("common.loading")}
      </div>
    );
  }

  const filtered = handovers.filter((h) => {
    if (filter === "completed") return h.status === "COMPLETED";
    if (filter === "pending")
      return h.status === "QR_GENERATED" || h.status === "COLLECTOR_CONFIRMED" || h.status === "VERIFIED" || h.status === "ACCEPTED";
    if (filter === "cancelled") return false; // demo: no cancelled state yet
    return true;
  });

  const filters: { key: Filter; label: string }[] = [
    { key: "all", label: t("recycler.transactions.filter_all") },
    { key: "completed", label: t("recycler.transactions.filter_completed") },
    { key: "pending", label: t("recycler.transactions.filter_pending") },
  ];

  return (
    <div className="flex flex-col min-h-full p-4 pb-6 space-y-5 bg-[#F7F5EE] animate-in fade-in">
      <div className="pt-2">
        <h1 className="text-2xl font-extrabold text-charcoal">
          {t("recycler.transactions.title")}
        </h1>
      </div>

      {/* FILTER CHIPS */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
        {filters.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`shrink-0 h-9 px-4 text-xs font-bold uppercase tracking-wider rounded border transition-colors ${
              filter === key
                ? "bg-primary text-white border-primary"
                : "bg-white text-muted-foreground border-warm-borders hover:border-primary/50"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* LIST */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-[#FDFCF8] border border-dashed border-[#DDD8CC] rounded">
          <FileText className="w-12 h-12 mb-3 text-muted-foreground opacity-20" />
          <p className="text-sm text-muted-foreground font-semibold">
            {filter === "all"
              ? t("recycler.transactions.no_transactions")
              : t("recycler.transactions.no_transactions_filter")}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((h) => (
            <TransactionCard key={h.id} handoverId={h.id} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Transaction card (live queries per item) ─────────────────────────────────

function TransactionCard({ handoverId }: { handoverId: string }) {
  const { t } = useTranslation();

  const handover = useLiveQuery(() => db.handovers.get(handoverId), [handoverId]);
  const lot = useLiveQuery(
    () => (handover ? db.lots.get(handover.lot_id) : undefined),
    [handover?.lot_id]
  );
  const payment = useLiveQuery(
    () =>
      db.payments.where("handover_id").equals(handoverId).first(),
    [handoverId]
  );

  if (!handover) return null;

  const material = lot?.payload.material_id || t("common.unknown_material");
  const weight = handover.verified_weight_kg
    ? `${handover.verified_weight_kg} kg`
    : "—";
  const amount = handover.final_amount
    ? `₹${handover.final_amount.toLocaleString()}`
    : "—";
  const shortId = handover.lot_id.substring(0, 8).toUpperCase();
  const dateStr = new Date(handover.created_at_local).toLocaleDateString();

  // Status chip
  const isCompleted = handover.status === "COMPLETED";
  const isPaid = !!payment;

  const statusLabel = isPaid
    ? t("status.paid")
    : isCompleted
    ? t("status.completed")
    : handover.status === "COLLECTOR_CONFIRMED"
    ? t("status.collector_confirmed")
    : t("status.qr_generated");

  const statusClass = isPaid
    ? "bg-success/10 text-success border-success/20"
    : isCompleted
    ? "bg-primary/10 text-primary border-primary/20"
    : "bg-amber-50 text-amber-700 border-amber-200";

  return (
    <Link
      to={`/recycler/transactions/${handoverId}`}
      className="block w-full active:scale-[0.98] transition-transform"
    >
      <Card className="border-t-[3px] border-t-charcoal border-x border-b bg-[#FDFCF8] border-[#E8E4D9] rounded-none shadow-none hover:bg-surface transition-colors">
        <CardContent className="p-4">
          <div className="flex justify-between items-start gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-extrabold text-charcoal uppercase tracking-tight text-base">
                  {material}
                </h3>
                <span
                  className={`text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded border ${statusClass}`}
                >
                  {statusLabel}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground font-semibold">
                <span>{weight}</span>
                <span className="text-[#DDD8CC]">|</span>
                <span className="text-[10px] font-bold uppercase tracking-widest">
                  #{shortId}
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">
                {dateStr}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-lg font-extrabold text-charcoal font-mono tabular-nums">
                {amount}
              </p>
              <ArrowRight className="w-4 h-4 text-muted-foreground ml-auto mt-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
