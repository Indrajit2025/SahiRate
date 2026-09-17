import { useAudio } from "@/hooks/useAudio";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX } from "lucide-react";

/**
 * AudioToggle — enables/disables audio guidance globally.
 * This is a toggle control, NOT a play button.
 * It does NOT trigger audio playback.
 */
export default function AudioToggle() {
  const { isAudioEnabled, toggleAudio } = useAudio();

  return (
    <Button
      variant="ghost"
      size="sm"
      className="flex items-center justify-center rounded-full h-11 px-2.5 bg-transparent text-charcoal hover:bg-surface active:scale-95 transition-transform"
      onClick={toggleAudio}
      aria-label={isAudioEnabled ? "Disable audio guidance" : "Enable audio guidance"}
    >
      {isAudioEnabled ? (
        <Volume2 className="w-4 h-4 text-primary shrink-0" />
      ) : (
        <VolumeX className="w-4 h-4 text-muted-foreground shrink-0" />
      )}
    </Button>
  );
}
