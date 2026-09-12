import { useNavigate } from "react-router-dom";
import { ArrowLeft, Volume2, Zap, Flame, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useI18nStore } from "@/i18n";

export default function Safety() {
  const navigate = useNavigate();
  const { t } = useI18nStore();

  const SAFETY_CARDS = [
    {
      title: t("collector.safety.battery_title"),
      icon: Zap,
      rules: (t("collector.safety.battery_rules") as unknown as string[]) || ["Do not puncture", "Do not burn", "Do not dismantle"],
      audioLabel: "बैटरी को न पंचर करें न जलाएं..."
    },
    {
      title: t("collector.safety.monitor_title"),
      icon: Monitor,
      rules: (t("collector.safety.monitor_rules") as unknown as string[]) || ["Handle carefully", "Avoid breaking glass", "Contains toxic dust"],
      audioLabel: "शीशा न तोड़ें..."
    },
    {
      title: t("collector.safety.cables_title"),
      icon: Flame,
      rules: (t("collector.safety.cables_rules") as unknown as string[]) || ["Don't burn wires", "Strip manually", "Avoid toxic smoke"],
      audioLabel: "तारों को न जलाएं..."
    }
  ];

  return (
    <div className="max-w-md mx-auto p-4 min-h-screen pb-20">
      <header className="flex items-center py-4 mb-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="mr-2">
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <span className="text-lg font-medium">{t("collector.safety.title")}</span>
      </header>

      <div className="space-y-6">
        {SAFETY_CARDS.map((card, i) => (
          <Card key={i} className="border-l-4 border-l-destructive">
            <CardContent className="p-0">
              <div className="flex items-center justify-between p-4 bg-muted/30 border-b">
                <div className="flex items-center gap-2">
                  <card.icon className="w-5 h-5 text-destructive" />
                  <h3 className="font-bold text-lg">{card.title}</h3>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full text-muted-foreground bg-muted"
                  disabled
                  aria-label="Play audio"
                  title="Audio not yet available"
                >
                  <Volume2 className="w-5 h-5" />
                </Button>
              </div>
              <div className="p-4">
                <ul className="space-y-2">
                  {card.rules.map((rule, j) => (
                    <li key={j} className="flex items-center text-sm">
                      <span className="text-destructive font-bold mr-2 text-lg">x</span>
                      {rule}
                    </li>
                  ))}
                </ul>
                <div className="mt-4 pt-3 border-t text-sm text-muted-foreground italic flex items-center">
                   <Volume2 className="w-4 h-4 mr-2" />
                   "{card.audioLabel}"
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
