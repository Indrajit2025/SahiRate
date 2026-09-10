import { useNavigate } from "react-router-dom";
import { ArrowLeft, Volume2, Zap, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const SAFETY_CARDS = [
  {
    title: "Battery",
    icon: Zap,
    rules: ["Do not puncture", "Do not burn", "Do not dismantle"],
    audioLabel: "बैटरी को न तोड़ें और न जलाएं..."
  },
  {
    title: "CRT Monitor",
    icon: Monitor, // Wait, Monitor needs to be imported, let's use another icon or import it
    rules: ["Handle carefully", "Avoid breaking glass", "Contains toxic dust"],
    audioLabel: "कांच न तोड़ें..."
  },
  {
    title: "Cables & Wires",
    icon: Flame,
    rules: ["Don't burn wires", "Strip manually", "Avoid toxic smoke"],
    audioLabel: "तारों को न जलाएं..."
  }
];

// Re-importing missing icon
import { Monitor } from "lucide-react";

export default function Safety() {
  const navigate = useNavigate();

  return (
    <div className="max-w-md mx-auto p-4 min-h-screen pb-20">
      <header className="flex items-center py-4 mb-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="mr-2">
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <span className="text-lg font-medium">Safety Guidelines</span>
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
                <Button variant="ghost" size="icon" className="rounded-full text-blue-600 bg-blue-50 hover:bg-blue-100">
                  <Volume2 className="w-5 h-5" />
                </Button>
              </div>
              <div className="p-4">
                <ul className="space-y-2">
                  {card.rules.map((rule, j) => (
                    <li key={j} className="flex items-center text-sm">
                      <span className="text-destructive font-bold mr-2 text-lg">×</span>
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
