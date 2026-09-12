class AudioPlayer {
  private currentAudio: HTMLAudioElement | null = null;
  private lastUrl: string | null = null;
  private lastPlayTime: number = 0;

  play(url: string) {
    const now = Date.now();
    // Prevent duplicate playback from strict mode / quick double renders
    if (this.lastUrl === url && now - this.lastPlayTime < 300) {
      return;
    }

    this.stop();

    this.lastUrl = url;
    this.lastPlayTime = now;

    this.currentAudio = new Audio(url);
    this.currentAudio.play().catch(err => {
      // Non-blocking visible error in development
      if (import.meta.env.DEV) {
        console.warn('Audio playback failed or missing asset:', err);
      }
    });
  }

  stop() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
  }
}

export const audioService = new AudioPlayer();
