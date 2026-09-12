import { useI18nStore } from '@/i18n';
import { useAudioStore } from '@/stores/audioStore';
import { audioService } from '@/services/audioService';

export function useAudio() {
  const language = useI18nStore(state => state.language);
  const isAudioEnabled = useAudioStore(state => state.isAudioEnabled);
  const toggleAudio = useAudioStore(state => state.toggleAudio);

  const playAudio = (key: string) => {
    if (!isAudioEnabled) return;
    const url = '/audio/' + language + '/' + key + '.mp3';
    audioService.play(url);
  };

  const stopAudio = () => {
    audioService.stop();
  }

  return { isAudioEnabled, toggleAudio, playAudio, stopAudio };
}
