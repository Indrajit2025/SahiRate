import { useAudio } from "@/hooks/useAudio";
import { Button } from "@/components/ui/button";
import { Volume2 } from "lucide-react";
import { useTranslation } from "@/i18n";

export default function AudioGuidance({ audioKey }: { audioKey: string }) {
  const { playAudio } = useAudio();
  const { t } = useTranslation();

  return (
    <Button 
      variant="secondary"
      size="sm"
      onClick={() => playAudio(audioKey)}
      className="flex items-center gap-2 mb-4 w-full justify-center text-primary bg-primary/10 hover:bg-primary/20"
    >
      <Volume2 className="w-4 h-4" />
      {t("common.play_audio") || "Play Audio"}
    </Button>
  );
}
