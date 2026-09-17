import { Link } from "react-router-dom";
import { useTranslation } from "@/i18n";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScanLine, Tag, Activity, ArrowRight, Camera } from "lucide-react";
import { DEMO_REF_RATES } from "@/services/refRates";

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

      {/* Market Snapshot - Today's Prices */}
      <div className="pt-2">
        <Card className="border-warm-borders bg-white shadow-sm rounded-3xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-muted-foreground uppercase tracking-widest">
              MARKET SNAPSHOT
            </span>
            <Link to="/rates" className="text-xs font-bold text-copper hover:text-copper/80 flex items-center gap-1 group transition-colors">
              See all <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="flex items-baseline justify-between border-b border-warm-borders/40 pb-3">
            <h2 className="text-2xl font-extrabold text-charcoal tracking-tight">
              Today's prices
            </h2>
            <span className="text-[10px] bg-amber-100/80 text-amber-800 border border-amber-200 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
              {t("public.landing.demo_notice")}
            </span>
          </div>

          <div className="divide-y divide-warm-borders/60">
            {DEMO_REF_RATES.filter(r => r.id !== "CABLE").map((item) => (
              <Link
                key={item.id}
                to="/rates"
                className="py-3.5 flex items-center justify-between hover:bg-surface/50 rounded-xl px-1 -mx-1 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  {/* Modern orange diamond glyph */}
                  <div className="w-6 h-6 rotate-45 rounded-[4px] border-2 border-copper/80 bg-copper/10 flex items-center justify-center shrink-0">
                    <div className="w-1.5 h-1.5 bg-copper rounded-[1px]" />
                  </div>
                  <div>
                    <p className="font-extrabold text-charcoal text-[15px] tracking-tight uppercase group-hover:text-primary transition-colors">
                      {item.label}
                    </p>
                    <p className="text-[11px] font-medium text-muted-foreground">
                      {item.observations || 18} observations
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 font-mono">
                  <span className="font-extrabold text-charcoal text-base">
                    ₹{item.min} - ₹{item.max}/{item.unitLabel}
                  </span>
                  <span className="text-emerald-600 font-bold text-base select-none">↑</span>
                </div>
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
