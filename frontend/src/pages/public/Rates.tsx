import { useTranslation } from "@/i18n";
import { Card } from "@/components/ui/card";
import { Info, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function Rates() {
  const { t } = useTranslation();

  const rates = [
    { id: 'pcb', name: t("public.rates.pcb"), price: '₹110/kg' },
    { id: 'copper', name: t("public.rates.copper"), price: '₹640/kg' },
    { id: 'aluminium', name: t("public.rates.aluminium"), price: '₹165/kg' },
    { id: 'battery', name: t("public.rates.battery"), price: '₹72/kg' },
    { id: 'plastic', name: t("public.rates.plastic"), price: '₹24/kg' },
  ];

  return (
    <div className="flex-1 flex flex-col px-4 py-6 space-y-6">
      
      <div className="flex items-center mb-2">
        <Link to="/" className="flex items-center gap-2 text-charcoal hover:text-primary transition-colors active:scale-95 -ml-2 p-2 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
          <span className="font-bold text-[15px]">Market Rates</span>
        </Link>
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-sm font-bold tracking-widest text-muted-foreground uppercase">
          {t("public.rates.title")}
        </h1>
        <div className="bg-amber-100/80 text-amber-800 border border-amber-200 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">
          {t("public.landing.demo_notice")}
        </div>
      </div>

      <Card className="border-warm-borders shadow-sm bg-surface overflow-hidden rounded-2xl">
        <div className="flex justify-between items-center p-4 bg-soft-sage/40 border-b border-warm-borders">
          <span className="font-bold text-muted-foreground text-xs uppercase tracking-widest">{t("public.rates.material")}</span>
          <span className="font-bold text-muted-foreground text-xs uppercase tracking-widest">{t("public.rates.rate")}</span>
        </div>
        <div className="divide-y divide-warm-borders">
          {rates.map((item) => (
            <div key={item.id} className="flex justify-between items-center p-4 hover:bg-white transition-colors">
              <span className="font-bold text-charcoal text-lg">{item.name}</span>
              <span className="font-bold text-primary text-xl font-mono tracking-tight">{item.price}</span>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex items-start gap-3 p-4 bg-surface/50 border border-warm-borders rounded-2xl">
        <Info className="w-5 h-5 text-copper shrink-0 mt-0.5" />
        <p className="text-sm text-charcoal leading-relaxed font-medium">
          {t("public.rates.disclaimer")}
        </p>
      </div>
    </div>
  );
}
