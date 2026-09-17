import { Link } from "react-router-dom";
import { useTranslation } from "@/i18n";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScanLine, Tag, Activity, ArrowRight, Camera } from "lucide-react";

export default function Home() {
  const { t } = useTranslation();

  return (
    <div className="flex-1 flex flex-col px-4 py-8 pb-16 space-y-10">
      
      {/* Hero Section */}
      <div className="text-center space-y-6 mt-4">
        <h1 className="text-4xl md:text-5xl font-extrabold text-charcoal leading-[1.15] tracking-tight">
          {t("public.landing.title")}
        </h1>
        
        <div className="flex flex-col gap-3 max-w-[280px] mx-auto pt-2">
          <Link to="/scan" className="w-full">
            <Button size="lg" className="w-full h-14 text-lg bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg shadow-primary/20 flex gap-2 active:scale-[0.98] transition-transform">
              <Camera className="w-5 h-5" />
              {t("public.landing.scan_cta")}
            </Button>
          </Link>
          <Link to="/rates" className="w-full">
            <Button size="lg" variant="outline" className="w-full h-14 text-lg border-2 border-warm-borders text-charcoal hover:bg-surface/80 hover:text-charcoal rounded-xl flex gap-2 active:scale-[0.98] transition-transform">
              <Activity className="w-5 h-5 text-copper" />
              {t("public.landing.rates_cta")}
            </Button>
          </Link>
        </div>
      </div>

      {/* How it works */}
      <div className="pt-4">
        <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-5 text-center">
          {t("public.landing.how_it_works")}
        </h2>
        <div className="flex justify-between items-center bg-surface border border-warm-borders rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-soft-sage flex items-center justify-center text-primary shrink-0">
              <ScanLine className="w-6 h-6" />
            </div>
            <span className="text-sm font-medium text-charcoal">{t("public.landing.step_1")}</span>
          </div>
          <ArrowRight className="w-5 h-5 text-warm-borders-dark shrink-0" />
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-soft-sage flex items-center justify-center text-primary shrink-0">
              <Tag className="w-6 h-6" />
            </div>
            <span className="text-sm font-medium text-charcoal">{t("public.landing.step_2")}</span>
          </div>
          <ArrowRight className="w-5 h-5 text-warm-borders-dark shrink-0" />
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-soft-sage flex items-center justify-center text-primary shrink-0">
              <span className="text-xl font-bold font-sans">₹</span>
            </div>
            <span className="text-sm font-medium text-charcoal">{t("public.landing.step_3")}</span>
          </div>
        </div>
      </div>

      {/* Today's Local Rates */}
      <div className="pt-2 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-charcoal tracking-tight">{t("public.landing.today_rates")}</h2>
          <span className="text-[10px] bg-amber-100/80 text-amber-800 border border-amber-200 px-2 py-1 rounded-md font-bold uppercase tracking-wider">
            {t("public.landing.demo_notice")}
          </span>
        </div>
        
        <Card className="border-warm-borders bg-white shadow-sm overflow-hidden rounded-2xl">
          <div className="divide-y divide-warm-borders">
            {[
              { id: 'pcb', name: t("public.rates.pcb"), price: '₹110/kg' },
              { id: 'copper', name: t("public.rates.copper"), price: '₹640/kg' },
              { id: 'aluminium', name: t("public.rates.aluminium"), price: '₹165/kg' }
            ].map((item) => (
              <div key={item.id} className="flex justify-between items-center p-4 hover:bg-surface/50 transition-colors">
                <span className="font-bold text-charcoal">{item.name}</span>
                <span className="text-xl font-bold text-primary font-mono tracking-tight">{item.price}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
