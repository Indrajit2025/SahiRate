import { useState } from "react";
import { Link } from "react-router-dom";
import { PackageOpen, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db/dexie";
import { DEMO_RECYCLER_ID } from "@/services/lots";
import { getDemoMidRate } from "@/services/refRates";
import { useTranslation } from "@/i18n";
import type { Lot } from "@/types";

type Filter = "all" | "available" | "accepted";

export default function IncomingLots() {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<Filter>("all");

  const lots = useLiveQuery(
    () =>
      db.lots
        .orderBy("created_at_local")
        .reverse()
        // Demo mode: show lots from any sync_status on the same device
        .toArray(),
    []
  );

  if (lots === undefined) {
    return (
      <div className="flex items-center justify-center p-12 text-muted-foreground">
        {t("common.loading")}
      </div>
    );
  }

  const filtered = lots.filter((l) => {
    const status = l.status || "available";
    if (filter === "available") return status === "available";
    if (filter === "accepted") return status === "accepted" && l.accepted_by === DEMO_RECYCLER_ID;
    return true; // "all"
  });

  const filters: { key: Filter; label: string }[] = [
    { key: "all", label: t("recycler.lots.filter_all") },
    { key: "available", label: t("recycler.lots.filter_available") },
    { key: "accepted", label: t("recycler.lots.filter_accepted") },
  ];

  return (
    <div className="flex flex-col min-h-full p-4 pb-6 space-y-5 bg-[#F7F5EE] animate-in fade-in slide-in-from-right-4">
      <div className="pt-2">
        <h1 className="text-2xl font-extrabold text-charcoal">
          {t("recycler.lots.title")}
        </h1>
        <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mt-1 bg-amber-50 border border-amber-200 rounded px-2 py-0.5 inline-block">
          {t("recycler.lots.demo_notice")}
        </p>
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

      {/* LOT LIST */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-[#FDFCF8] border border-dashed border-[#DDD8CC] rounded">
          <PackageOpen className="w-12 h-12 mb-3 text-muted-foreground opacity-20" />
          <p className="text-sm text-muted-foreground font-semibold">
            {filter === "all"
              ? t("recycler.lots.no_lots")
              : t("recycler.lots.no_lots_filter")}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((lot) => (
            <LotCard key={lot.id} lot={lot} t={t} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Individual lot card ───────────────────────────────────────────────────────

function LotCard({
  lot,
  t,
}: {
  lot: Lot;
  t: (key: any, params?: any) => string;
}) {
  const photo = useLiveQuery(
    () => db.photos.where("lot_id").equals(lot.id).first(),
    [lot.id]
  );

  const refRate = getDemoMidRate(lot.payload.material_id);
  const status = lot.status || "available";
  const isAccepted = status === "accepted" && lot.accepted_by === DEMO_RECYCLER_ID;
  const shortId = lot.id.substring(0, 8).toUpperCase();

  return (
    <Link
      to={`/recycler/lot/${lot.id}`}
      className="block w-full active:scale-[0.98] transition-transform"
    >
      <Card className="overflow-hidden border-0 bg-[#FDFCF8] shadow-sm border border-[#E8E4D9] rounded">
        {/* Photo */}
        {photo ? (
          <img
            src={photo.data_uri}
            alt="Scrap material"
            className="w-full h-32 object-cover"
          />
        ) : (
          <div className="w-full h-20 bg-[#EDE9E0] flex items-center justify-center">
            <PackageOpen className="w-8 h-8 text-muted-foreground opacity-25" />
          </div>
        )}

        <CardContent className="p-4">
          {/* Material + status */}
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-extrabold text-charcoal uppercase tracking-tight text-lg leading-none">
                  {lot.payload.material_id || t("common.unknown_material")}
                </h3>
                <Badge className="text-[9px] font-bold bg-primary/10 text-primary border-0 px-1.5 py-0.5 rounded uppercase tracking-wider">
                  {t("recycler.lots.ai_verified")}
                </Badge>
              </div>
            </div>
            <span
              className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded shrink-0 ml-2 ${
                isAccepted
                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                  : "bg-primary/10 text-primary border border-primary/20"
              }`}
            >
              {isAccepted ? t("status.accepted") : t("status.available")}
            </span>
          </div>

          {/* Details row */}
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-muted-foreground">
                {lot.payload.approx_weight_kg
                  ? `${lot.payload.approx_weight_kg} kg`
                  : t("recycler.lots.weight_unknown")}
              </p>
              {refRate && (
                <p className="text-xs font-bold text-[#C56A3D] mt-0.5">
                  {t("recycler.lots.ref_rate", { rate: refRate })}
                </p>
              )}
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">
                #{shortId}
              </p>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-primary border border-primary/30 bg-primary/5 rounded px-3 py-1.5 shrink-0">
              {t("recycler.lots.inspect")} <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
