import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db/dexie";
import { useTranslation } from "@/i18n";

export default function Earnings() { const { t } = useTranslation();
  const navigate = useNavigate();

  const lots = useLiveQuery(() => db.lots.orderBy("created_at_local").reverse().toArray(), []) || [];
  const handovers = useLiveQuery(() => db.handovers.toArray(), []) || [];
  const payments = useLiveQuery(() => db.payments.toArray(), []) || [];

  const totalEarnings = payments.reduce((sum, p) => sum + p.amount, 0);

  const pendingEarnings = lots.reduce((sum, lot) => {
    const handover = handovers.find(h => h.lot_id === lot.id);
    const payment = handover ? payments.find(p => p.handover_id === handover.id) : null;
    if (!payment) {
      return sum + (handover?.final_amount || lot.payload.estimated_value || 0);
    }
    return sum;
  }, 0);

  // Grouping logic (simplified)
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const todayEarnings = payments.filter(p => new Date(p.created_at_local) >= todayStart).reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="flex flex-col min-h-screen p-4 pb-24 space-y-6 animate-in fade-in slide-in-from-right-4">
      <header className="flex items-center py-4">
        <button
          onClick={() => navigate("/collector")}
          className="mr-4 text-muted-foreground hover:text-charcoal"
          aria-label={t("common.go_back_dashboard") || "Back"}
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-charcoal">{t("collector.earnings.title") || "Earnings"}</h1>
        </div>
      </header>

      <section>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 px-1">
          {t("collector.earnings.total_earnings")}
        </p>
        <Card className="border-warm-borders bg-surface shadow-sm rounded-xl">
          <CardContent className="p-6">
            <div className="text-5xl font-extrabold text-primary font-mono tracking-tight mb-4">
              ₹{totalEarnings.toLocaleString()}
            </div>
            <div className="flex justify-between items-center border-t border-warm-borders pt-4">
              <span className="text-sm font-bold text-muted-foreground">{t("collector.earnings.pending_payments")}</span>
              <span className="text-lg font-bold text-charcoal font-mono">₹{pendingEarnings.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid grid-cols-2 gap-4">
        <Card className="border-warm-borders bg-white shadow-sm rounded-xl">
          <CardContent className="p-4 text-center">
             <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{t("common.date")}</p>
             <p className="text-2xl font-extrabold text-charcoal font-mono">₹{todayEarnings.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="border-warm-borders bg-white shadow-sm rounded-xl">
          <CardContent className="p-4 text-center">
             <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{t("collector.earnings.this_month")}</p>
             <p className="text-2xl font-extrabold text-charcoal font-mono">₹{totalEarnings.toLocaleString()}</p>
          </CardContent>
        </Card>
      </section>

      <section>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 px-1 mt-2">
          {t("collector.earnings.recent_transactions") || "RECENT TRANSACTIONS"}
        </p>
        <div className="space-y-3">
          {lots.length === 0 && (
            <div className="flex flex-col items-center justify-center p-8 text-center border-2 border-dashed rounded-xl border-warm-borders bg-surface">
              <h3 className="font-bold text-muted-foreground">{t("collector.earnings.no_transactions") || "No transactions yet"}</h3>
            </div>
          )}
          {lots.map(lot => {
            const handover = handovers.find(h => h.lot_id === lot.id);
            const payment = handover ? payments.find(p => p.handover_id === handover.id) : null;
            const displayAmount = payment?.amount ?? handover?.final_amount ?? lot.payload.estimated_value ?? "—";
            const displayWeight = handover?.verified_weight_kg ?? lot.payload.approx_weight_kg ?? "—";

            return (
              <Card key={lot.id} className="border-warm-borders bg-white shadow-sm rounded-xl">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-charcoal text-base">
                      {t(`material.${lot.payload.material_id}` as any) || lot.payload.material_id}
                    </h3>
                    <p className="text-sm text-muted-foreground font-medium">{displayWeight} kg • {new Date(lot.created_at_local).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-charcoal text-base font-mono">₹{displayAmount}</p>
                    {payment ? (
                      <span className="text-[10px] uppercase font-bold text-success flex items-center justify-end gap-1 mt-1">
                        <CheckCircle2 className="w-3 h-3"/> {t("status.paid")}
                      </span>
                    ) : (
                      <span className="text-[10px] uppercase font-bold text-amber-600 flex items-center justify-end gap-1 mt-1">
                        <Clock className="w-3 h-3"/> {t("status.pending")}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
