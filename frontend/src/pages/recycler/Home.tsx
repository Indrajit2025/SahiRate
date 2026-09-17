import { Link } from "react-router-dom";
import { ArrowRight, PackageOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db/dexie";
import { DEMO_RECYCLER_ID } from "@/services/lots";
import { getDemoMidRate } from "@/services/refRates";
import { useTranslation } from "@/i18n";
import AudioGuidance from "@/components/AudioGuidance";

export default function RecyclerHome() {
  const { t } = useTranslation();

  // Incoming: all lots that are available (demo: any sync_status from same device)
  const incomingLots = useLiveQuery(
    () =>
      db.lots
        .orderBy("created_at_local")
        .reverse()
        .filter((l) => (l.status || "available") === "available")
        .toArray(),
    []
  );

  // Accepted today by this recycler
  const today = new Date().toDateString();
  const acceptedToday = useLiveQuery(
    () =>
      db.lots
        .filter(
          (l) =>
            l.status === "accepted" &&
            l.accepted_by === DEMO_RECYCLER_ID &&
            l.accepted_at !== undefined &&
            new Date(l.accepted_at).toDateString() === today
        )
        .count(),
    [today]
  );

  // Today's purchase amount from completed payments
  const todayPurchased = useLiveQuery(async () => {
    const payments = await db.payments.toArray();
    let total = 0;
    for (const p of payments) {
      if (p.paid_at && new Date(p.paid_at).toDateString() === today) {
        total += p.amount;
      }
    }
    return total;
  }, [today]);

  // Lot photos for preview
  const previewLots = incomingLots?.slice(0, 2) ?? [];

  const incomingCount = incomingLots?.length ?? 0;

  return (
    <div className="flex flex-col min-h-full p-4 pb-6 space-y-5 bg-[#F7F5EE] animate-in fade-in">
      {/* YARD IDENTITY */}
      <div className="pt-2">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">
          {t("recycler.home.greeting")}
        </p>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-extrabold text-charcoal leading-tight">
            {t("recycler.home.yard_name")}
          </h1>
          <span className="text-[9px] font-bold uppercase tracking-widest bg-amber-100 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded">
            {t("recycler.home.demo_badge")}
          </span>
        </div>
      </div>

      {/* AUDIO GUIDANCE */}
      <AudioGuidance audioKey="recycler_home" />

      {/* OPERATIONAL SUMMARY */}
      <section>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 px-0.5">
          TODAY'S PROCUREMENT
        </p>
        <div className="grid grid-cols-3 gap-2">
          {/* Incoming */}
          <Link to="/recycler/lots" className="block">
            <Card className="border-t-[3px] border-t-primary bg-[#FDFCF8] rounded-none shadow-none border-x border-b border-[#E8E4D9] hover:bg-surface transition-colors">
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-extrabold text-charcoal font-mono tabular-nums">
                  {incomingCount}
                </p>
                <p className="text-[10px] font-bold text-primary uppercase tracking-widest mt-1">
                  {t("recycler.home.incoming_lots")}
                </p>
              </CardContent>
            </Card>
          </Link>

          {/* Accepted today */}
          <Card className="border-t-[3px] border-t-charcoal bg-[#FDFCF8] rounded-none shadow-none border-x border-b border-[#E8E4D9]">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-extrabold text-charcoal font-mono tabular-nums">
                {acceptedToday ?? 0}
              </p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                {t("recycler.home.accepted_today")}
              </p>
            </CardContent>
          </Card>

          {/* Purchased */}
          <Card className="border-t-[3px] border-t-copper bg-[#FDFCF8] rounded-none shadow-none border-x border-b border-[#E8E4D9]">
            <CardContent className="p-3 text-center">
              <p className="text-lg font-extrabold text-[#C56A3D] font-mono tabular-nums leading-none mt-1">
                ₹{(todayPurchased ?? 0).toLocaleString()}
              </p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1.5">
                {t("recycler.home.purchased_today")}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* INCOMING LOT PREVIEW */}
      <section>
        <div className="flex justify-between items-end mb-2 px-0.5">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            {t("recycler.home.incoming_preview")}
          </p>
          <Link
            to="/recycler/lots"
            className="text-xs font-bold text-primary hover:underline flex items-center"
          >
            {t("recycler.home.view_all")}{" "}
            <ArrowRight className="w-3 h-3 ml-1" />
          </Link>
        </div>

        {previewLots.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center bg-[#FDFCF8] border border-dashed border-[#DDD8CC] rounded">
            <PackageOpen className="w-10 h-10 mb-2 text-muted-foreground opacity-25" />
            <p className="text-sm text-muted-foreground font-semibold">
              {t("recycler.home.no_incoming")}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {previewLots.map((lot) => (
              <IncomingLotCard key={lot.id} lot={lot} t={t} />
            ))}
          </div>
        )}
      </section>

      {/* ROLE SWITCH */}
      <div className="pt-2 text-center">
        <Link
          to="/"
          className="text-xs font-semibold text-muted-foreground hover:text-charcoal hover:underline"
        >
          Switch Role →
        </Link>
      </div>
    </div>
  );
}

// ─── Lot preview card ─────────────────────────────────────────────────────────

function IncomingLotCard({
  lot,
  t,
}: {
  lot: import("@/types").Lot;
  t: (key: any, params?: any) => string;
}) {
  const photo = useLiveQuery(
    () => db.photos.where("lot_id").equals(lot.id).first(),
    [lot.id]
  );
  const refRate = getDemoMidRate(lot.payload.material_id);
  const shortId = lot.id.substring(0, 8).toUpperCase();

  return (
    <Link to={`/recycler/lot/${lot.id}`} className="block w-full active:scale-[0.98] transition-transform">
      <Card className="overflow-hidden border-0 bg-[#FDFCF8] shadow-sm border border-[#E8E4D9] rounded">
        {/* Photo strip */}
        {photo ? (
          <img
            src={photo.data_uri}
            alt="Scrap material"
            className="w-full h-28 object-cover"
          />
        ) : (
          <div className="w-full h-20 bg-[#EDE9E0] flex items-center justify-center">
            <PackageOpen className="w-8 h-8 text-muted-foreground opacity-30" />
          </div>
        )}
        <CardContent className="p-3">
          <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="font-extrabold text-charcoal uppercase tracking-tight text-base">
                  {lot.payload.material_id || t("common.unknown_material")}
                </h3>
                <Badge className="text-[9px] font-bold bg-primary/10 text-primary border-0 px-1.5 py-0.5 rounded uppercase tracking-wider">
                  {t("recycler.home.ai_verified")}
                </Badge>
              </div>
              <p className="text-sm font-semibold text-muted-foreground">
                {lot.payload.approx_weight_kg
                  ? `${lot.payload.approx_weight_kg} kg`
                  : t("recycler.lots.weight_unknown")}
              </p>
              {refRate && (
                <p className="text-xs font-bold text-[#C56A3D] mt-0.5">
                  {t("recycler.home.ref_rate", { rate: refRate })}
                </p>
              )}
            </div>
            <div className="text-right flex flex-col items-end gap-2 shrink-0 ml-3">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                #{shortId}
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-primary border border-primary/30 bg-primary/5 rounded px-2 py-1">
                {t("recycler.home.inspect_lot")} <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
