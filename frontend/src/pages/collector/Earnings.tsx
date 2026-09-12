import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db/dexie";
import { useI18nStore } from "@/i18n";

export default function Earnings() { const { t } = useI18nStore();
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

  return (
    <div className="max-w-md mx-auto p-4 min-h-screen pb-20">
      <header className="flex items-center py-4 mb-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="mr-2">
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <span className="text-lg font-medium">{t("collector.earnings.title")}</span>
      </header>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <Card className="bg-primary/10 border-primary/20">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground font-medium mb-1">{t("collector.earnings.total_earnings")}</p>
            <p className="text-2xl font-bold text-primary">₹{totalEarnings}</p>
          </CardContent>
        </Card>
        <Card className="bg-secondary/20 border-secondary/30">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground font-medium mb-1">{t("collector.earnings.pending_payments")}</p>
            <p className="text-2xl font-bold text-secondary-foreground">₹{pendingEarnings}</p>
          </CardContent>
        </Card>
      </div>

      <h3 className="font-semibold text-lg mb-4">{t("collector.earnings.recent_transactions")}</h3>
      <div className="space-y-3">
        {lots.length === 0 && (
          <p className="text-center text-muted-foreground py-8">{t("collector.earnings.no_transactions")}</p>
        )}
        {lots.map(lot => {
          const handover = handovers.find(h => h.lot_id === lot.id);
          const payment = handover ? payments.find(p => p.handover_id === handover.id) : null;
          const displayAmount = payment?.amount ?? handover?.final_amount ?? lot.payload.estimated_value ?? "—";
          const displayWeight = handover?.verified_weight_kg ?? lot.payload.approx_weight_kg ?? "—";

          return (
            <Card key={lot.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold">{t(`material.${lot.payload.material_id}` as any) || t("common.unknown_material")}</p>
                  <p className="text-sm text-muted-foreground">{displayWeight} kg • {new Date(lot.created_at_local).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">₹{displayAmount}</p>
                  {payment ? (
                    <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 mt-1">
                      <CheckCircle2 className="w-3 h-3 mr-1"/> {t("status.paid")}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50 mt-1">
                      <Clock className="w-3 h-3 mr-1"/> {t("status.pending")}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
