import { useI18nStore } from '@/i18n';
import { useAudioStore } from '@/stores/audioStore';
import { audioService } from '@/services/audioService';

/**
 * Languages that have actual audio asset directories under /audio/<lang>/.
 * or and bn do not have audio assets — they fall back to English.
 */
const SUPPORTED_AUDIO_LANGS = ['en', 'hi', 'mr'] as const;

export function useAudio() {
  const language = useI18nStore((state) => state.language);
  const isAudioEnabled = useAudioStore((state) => state.isAudioEnabled);
  const toggleAudio = useAudioStore((state) => state.toggleAudio);

  /**
   * Play audio for the given key in the current language.
   * Called only from an explicit user gesture — never on mount/route change.
   */
  const playAudio = (key: string) => {
    if (!isAudioEnabled) return;

    const audioLang = SUPPORTED_AUDIO_LANGS.includes(language as any) ? language : 'en';
    const url = `/audio/${audioLang}/${key}.mp3`;
    audioService.play(url);
  };

  const stopAudio = () => {
    audioService.stop();
  };

  return { isAudioEnabled, toggleAudio, playAudio, stopAudio };
}
