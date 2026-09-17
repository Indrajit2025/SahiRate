import { useNavigate } from "react-router-dom";
import { ArrowLeft, Volume2, Zap, Flame, Monitor, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "@/i18n";
import { useAudio } from "@/hooks/useAudio";

export default function Safety() {
  const { playAudio } = useAudio();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const SAFETY_CARDS = [
    {
      title: t("collector.safety.battery_title") || "Battery Protocols",
      icon: Zap,
      rules: (t("collector.safety.battery_rules") as unknown as string[]) || ["Do not puncture", "Do not burn", "Do not dismantle"],
      audioKey: "collector.safety.battery_rules"
    },
    {
      title: t("collector.safety.monitor_title") || "Monitor Protocols",
      icon: Monitor,
      rules: (t("collector.safety.monitor_rules") as unknown as string[]) || ["Handle carefully", "Avoid breaking glass", "Contains toxic dust"],
      audioKey: "collector.safety.monitor_rules"
    },
    {
      title: t("collector.safety.cables_title") || "Cable Protocols",
      icon: Flame,
      rules: (t("collector.safety.cables_rules") as unknown as string[]) || ["Don't burn wires", "Strip manually", "Avoid toxic smoke"],
      audioKey: "collector.safety.cables_rules"
    }
  ];

  return (
    <div className="flex flex-col min-h-screen p-4 pb-20 space-y-4 animate-in fade-in slide-in-from-right-4 bg-background">
      <header className="flex items-center py-4">
        <button
          onClick={() => navigate("/collector")}
          className="mr-4 text-muted-foreground hover:text-charcoal"
          aria-label={t("common.go_back_dashboard") || "Back"}
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-extrabold text-charcoal tracking-tight flex items-center gap-2">
          {t("collector.safety.title") || "Safety Protocols"}
          <AlertTriangle className="w-6 h-6 text-amber-500" />
        </h1>
      </header>

      <div className="space-y-6 pt-2">
        {SAFETY_CARDS.map((card, i) => (
          <Card key={i} className="border-l-[6px] border-l-red-600 bg-[#FFFDF7] shadow-sm rounded-r-xl overflow-hidden border-y border-r border-[#E8E4D9]">
            <CardContent className="p-0">
              <div className="flex items-center justify-between p-4 bg-red-50/50 border-b border-[#E8E4D9]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
                    <card.icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-extrabold text-charcoal text-lg uppercase tracking-tight">{card.title}</h3>
                </div>
                <button
                  className="w-10 h-10 rounded-full flex items-center justify-center text-red-700 bg-red-100 hover:bg-red-200 active:scale-95 transition-all"
                  onClick={() => playAudio(card.audioKey)}
                  aria-label={t("common.play_audio") || "Play Audio"}
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-5 space-y-3">
                {card.rules.map((rule, j) => (
                  <div key={j} className="flex items-start gap-3">
                    <div className="mt-[2px] w-5 h-5 bg-red-100 rounded flex items-center justify-center shrink-0">
                      <span className="text-red-700 font-extrabold text-xs">x</span>
                    </div>
                    <span className="text-charcoal font-bold">{rule}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <p className="text-center text-[11px] font-bold text-muted-foreground uppercase tracking-widest pt-8">
        Always wear protective gear
      </p>
    </div>
  );
}
