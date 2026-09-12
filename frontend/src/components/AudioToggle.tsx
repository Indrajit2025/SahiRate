import { useAudio } from "@/hooks/useAudio";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX } from "lucide-react";

export default function AudioToggle() {
  const { isAudioEnabled, toggleAudio } = useAudio();

  return (
    <Button
      variant="outline"
      size="sm"
      className="flex items-center justify-center rounded-full w-10 h-10 border-slate-300 p-0"
      onClick={toggleAudio}
      aria-label={isAudioEnabled ? "Disable audio guidance" : "Enable audio guidance"}
    >
      {isAudioEnabled ? (
        <Volume2 className="w-5 h-5 text-primary" />
      ) : (
        <VolumeX className="w-5 h-5 text-muted-foreground" />
      )}
    </Button>
  );
}
