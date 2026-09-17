import { useNavigate } from "react-router-dom";
import { ArrowLeft, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const MOCK_PRICES = [
  { id: 'PCB', label: 'PCB Board', min: 115, max: 135, trend: 'up', pct: 7 },
  { id: 'CABLE', label: 'Wires', min: 60, max: 80, trend: 'up', pct: 4 },
  { id: 'BATTERY', label: 'Battery', min: 90, max: 110, trend: '{t("status.stable")}', pct: 0 },
  { id: 'DISPLAY', label: 'Screen', min: 40, max: 50, trend: 'down', pct: 2 },
];

export default function PriceBoard() { const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="max-w-md mx-auto p-4 min-h-screen pb-20">
      <header className="flex items-center py-4 mb-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="mr-2">
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <span className="text-lg font-medium">Local Price Board</span>
      </header>

      <div className="space-y-3">
        {MOCK_PRICES.map(p => (
          <Card key={p.id}>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-lg">{t(`material.${p.id}` as any)}</p>
                <div className="flex items-center gap-2 mt-1">
                  {p.trend === 'up' && <Badge variant="outline" className="text-green-600 bg-green-50"><TrendingUp className="w-3 h-3 mr-1"/> {p.pct}%</Badge>}
                  {p.trend === 'down' && <Badge variant="outline" className="text-red-600 bg-red-50"><TrendingDown className="w-3 h-3 mr-1"/> {p.pct}%</Badge>}
                  {p.trend === '{t("status.stable")}' && <Badge variant="outline" className="text-slate-600 bg-slate-50"><Minus className="w-3 h-3 mr-1"/> {t("status.stable")}</Badge>}
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg text-primary">₹{p.min} - ₹{p.max}</p>
                <p className="text-xs text-muted-foreground">per kg</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="text-center text-xs text-muted-foreground mt-8">Note: These are demo prices for reference. Live prices will be available in a future update.</p>
    </div>
  );
}
