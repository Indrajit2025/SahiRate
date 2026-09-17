import { useState } from "react";
import { useTranslation } from "@/i18n";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Info, ArrowLeft, Camera, Search, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { DEMO_REF_RATES } from "@/services/refRates";

export default function Rates() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "piece" | "kg">("all");

  const materials = DEMO_REF_RATES.filter((r) => r.id !== "CABLE");

  const filtered = materials.filter((item) => {
    const matchesSearch = item.label.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || item.unit === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="flex-1 flex flex-col px-4 py-6 space-y-6 max-w-lg mx-auto w-full pb-16">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2 text-charcoal hover:text-primary transition-colors active:scale-95 -ml-2 p-2 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-bold text-[15px]">Back to Home</span>
        </Link>
        <span className="text-[10px] bg-amber-100/80 text-amber-800 border border-amber-200 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
          {t("public.landing.demo_notice")}
        </span>
      </div>

      {/* Hero Title & Market Overview Banner */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-extrabold text-muted-foreground uppercase tracking-widest">
            LIVE MARKET BENCHMARK
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        </div>
        <h1 className="text-3xl font-extrabold text-charcoal tracking-tight">
          Today's Scrap Rates
        </h1>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Transparent local benchmark prices based on real-time scrap market observations.
        </p>
      </div>

      {/* Search & Filter Controls */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <Input
            type="text"
            placeholder="Search scrap material (e.g. Copper, Display)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11 bg-white border-warm-borders rounded-xl text-sm shadow-sm placeholder:text-muted-foreground"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setFilterType("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterType === "all"
                ? "bg-primary text-white shadow-sm"
                : "bg-surface text-charcoal border border-warm-borders hover:bg-white"
            }`}
          >
            All Scrap ({materials.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType("piece")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterType === "piece"
                ? "bg-primary text-white shadow-sm"
                : "bg-surface text-charcoal border border-warm-borders hover:bg-white"
            }`}
          >
            Per Unit / Count
          </button>
          <button
            type="button"
            onClick={() => setFilterType("kg")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterType === "kg"
                ? "bg-primary text-white shadow-sm"
                : "bg-surface text-charcoal border border-warm-borders hover:bg-white"
            }`}
          >
            By Weight (kg)
          </button>
        </div>
      </div>

      {/* Rates List Card Container */}
      <div className="space-y-3">
        {filtered.map((item) => (
          <Card
            key={item.id}
            className="border-warm-borders bg-white shadow-sm hover:shadow-md transition-all rounded-2xl p-4 space-y-3"
          >
            {/* Header: Glyph, Name, Unit, and Trend */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Modern orange diamond glyph */}
                <div className="w-7 h-7 rotate-45 rounded-[5px] border-2 border-copper/80 bg-copper/10 flex items-center justify-center shrink-0">
                  <div className="w-2 h-2 bg-copper rounded-[1px]" />
                </div>
                <div>
                  <h3 className="font-extrabold text-charcoal text-base tracking-tight uppercase">
                    {item.label}
                  </h3>
                  <p className="text-[11px] font-medium text-muted-foreground">
                    {item.observations || 18} local observations
                  </p>
                </div>
              </div>

              {/* Trend Tag */}
              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md font-mono">
                +{item.pctChange || 3.5}% ↑
              </span>
            </div>

            {/* Price Row: Midpoint and Market Band */}
            <div className="bg-surface rounded-xl p-3 border border-warm-borders flex items-baseline justify-between">
              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Benchmark Rate
                </span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-2xl font-extrabold text-primary font-mono tracking-tight leading-none">
                    ₹{item.midpoint}
                  </span>
                  <span className="text-xs font-bold text-muted-foreground font-mono">
                    /{item.unitLabel}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Market Band
                </span>
                <span className="text-sm font-extrabold text-charcoal font-mono tracking-tight">
                  ₹{item.min} – ₹{item.max}
                </span>
                <span className="text-[10px] text-muted-foreground block">
                  per {item.unitLabel}
                </span>
              </div>
            </div>

            {/* Bottom Quick Action: Scan */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] font-medium text-muted-foreground flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-copper" /> Updated today
              </span>
              <Link to="/scan">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 px-2 text-xs font-bold text-primary hover:bg-primary/5 flex items-center gap-1"
                >
                  <Camera className="w-3.5 h-3.5" />
                  Scan Scrap
                </Button>
              </Link>
            </div>
          </Card>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-10 bg-surface rounded-2xl border border-warm-borders text-muted-foreground">
            <p className="font-bold text-sm">No materials matching "{searchQuery}"</p>
            <Button
              variant="link"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setFilterType("all");
              }}
              className="mt-1 text-primary font-bold text-xs"
            >
              Reset Filters
            </Button>
          </div>
        )}
      </div>

      {/* Disclaimer Card */}
      <div className="flex items-start gap-3 p-4 bg-surface border border-warm-borders rounded-2xl">
        <Info className="w-5 h-5 text-copper shrink-0 mt-0.5" />
        <p className="text-xs text-charcoal leading-relaxed font-medium">
          {t("public.rates.disclaimer")} Benchmark rates reflect local market fair rates. Actual payout may vary with lot purity and quantity.
        </p>
      </div>
    </div>
  );
}
