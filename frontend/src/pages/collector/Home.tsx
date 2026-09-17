import { Link } from "react-router-dom";
import { Camera, FileText, QrCode, ShieldAlert, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCreateLotStore } from "@/stores/createLotStore";
import { db } from "@/db/dexie";
import { useLiveQuery } from "dexie-react-hooks";
import { useTranslation } from "@/i18n";

export default function CollectorHome() {
  const { t, language } = useTranslation();

  const lots = useLiveQuery(() => db.lots.orderBy("created_at_local").reverse().toArray(), []) || [];
  
  // Calculate today's summary
  const today = new Date().toDateString();
  const todayLots = lots.filter(l => new Date(l.created_at_local).toDateString() === today);
  const todayWeight = todayLots.reduce((sum, l) => sum + (l.payload.approx_weight_kg || 0), 0);
  const todayValue = todayLots.reduce((sum, l) => sum + (l.payload.estimated_value || 0), 0);

  const recentLots = lots.slice(0, 2); // Show top 2

  return (
    <div className="flex flex-col min-h-screen p-4 pb-20 space-y-6 bg-background animate-in fade-in">
      
      <div className="pt-2">
        <h1 className="text-2xl font-extrabold text-charcoal mb-1">
          {t("common.good_morning") || "Good morning,"}
        </h1>
        <p className="text-muted-foreground font-medium">{t("collector.home.ready_to_collect") || "Ready to collect scrap?"}</p>
      </div>

      {/* NEW SCRAP COLLECTION - Dominant CTA */}
      <section>
        <Link
          to="/collector/create-lot"
          className="block w-full active:scale-[0.98] transition-transform"
          onClick={async () => {
            const draft_id = useCreateLotStore.getState().draft_id;
            if (draft_id) {
              const existingLot = await db.lots.get(draft_id);
              if (!existingLot) {
                await db.photos.where("lot_id").equals(draft_id).delete();
              }
            }
            useCreateLotStore.getState().reset();
          }}
        >
          <Button
            size="lg"
            className="w-full h-[120px] text-xl bg-primary hover:bg-primary/90 text-white rounded-2xl shadow-lg shadow-primary/20 flex flex-col items-center justify-center gap-3 border-none"
          >
            <Camera className="w-10 h-10" />
            <span className="font-bold tracking-wide uppercase">{t("collector.home.new_collection")}</span>
          </Button>
        </Link>
      </section>

      {/* TODAY'S SUMMARY */}
      <section>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 px-1">
          {t("collector.home.today_summary") || "TODAY'S COLLECTION"}
        </p>
        <Card className="border-t-[3px] border-t-charcoal border-x-0 border-b-0 bg-[#FDFCF8] rounded-none shadow-none">
          <CardContent className="p-4 flex items-center justify-between border border-[#E8E4D9] border-t-0">
            <div>
              <p className="text-2xl font-extrabold text-charcoal tabular-nums font-mono tracking-tight">{todayWeight.toFixed(1)} kg</p>
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mt-1">{todayLots.length} {todayLots.length === 1 ? 'collection' : 'collections'}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-extrabold text-primary tabular-nums font-mono tracking-tight">₹{todayValue.toLocaleString()}</p>
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Reference estimate</p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* RECENT COLLECTIONS */}
      {recentLots.length > 0 && (
        <section>
          <div className="flex justify-between items-end mb-2 px-1">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              {t("collector.home.recent") || "RECENT COLLECTIONS"}
            </p>
            <Link to="/collector/history" className="text-xs font-bold text-primary hover:underline flex items-center">
              {t("collector.home.view_all") || "View all"} <ArrowRight className="w-3 h-3 ml-1" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentLots.map(lot => (
              <Card key={lot.id} className="border-t-2 border-t-warm-borders border-x-0 border-b-0 bg-white rounded-none shadow-none">
                <CardContent className="p-3 flex justify-between items-center bg-[#FDFCF8] border border-[#E8E4D9] border-dashed">
                  <div>
                    <h3 className="font-extrabold text-charcoal text-[15px] uppercase tracking-tight">
                      {t(`material.${lot.payload.material_id}` as any) || lot.payload.material_id}
                    </h3>
                    <p className="text-sm text-muted-foreground font-semibold">{lot.payload.approx_weight_kg} kg</p>
                  </div>
                  <div className="text-right">
                    <p className="font-extrabold text-charcoal text-base font-mono">₹{lot.payload.estimated_value?.toLocaleString()}</p>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{lot.sync_status}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* SAFETY */}
      <section>
        <Link to="/collector/safety" className="block w-full active:scale-[0.98] transition-transform">
          <Card className="border-l-[6px] border-l-amber-500 bg-[#FFFDF7] rounded-r-xl rounded-l-none shadow-sm border-y border-r border-[#E8E4D9]">
            <CardContent className="flex items-start p-4 gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-extrabold text-charcoal block mb-1 tracking-tight">{t("collector.home.safety")}</span>
                <span className="text-sm text-muted-foreground font-semibold leading-tight block">
                  Remove batteries and outer casing before handling. Keep dry.
                </span>
              </div>
            </CardContent>
          </Card>
        </Link>
      </section>

    </div>
  );
}
