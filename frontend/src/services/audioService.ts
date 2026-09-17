const DEV = import.meta.env.DEV;

class AudioPlayer {
  private currentAudio: HTMLAudioElement | null = null;
  private currentRequestId: number = 0;

  async play(url: string): Promise<void> {
    // Stop any currently playing audio first
    this.stop();

    this.currentRequestId++;
    const requestId = this.currentRequestId;

    if (DEV) console.log(`[SahiRate Audio] Loading: ${url}`);

    const audio = new Audio();
    this.currentAudio = audio;

    return new Promise((resolve) => {
      audio.onerror = () => {
        if (this.currentRequestId === requestId) {
          // A real asset failure — warn clearly in dev.
          const errCode = audio.error?.code;
          if (DEV) {
            console.warn(
              `[SahiRate Audio] Missing asset (MediaError code ${errCode}): ${url}`
            );
          }
          this.currentAudio = null;
        }
        resolve();
      };

      audio.src = url;

      const playPromise = audio.play();

      if (playPromise === undefined) {
        // Older browsers: play() returned void synchronously
        if (DEV) console.log('[SahiRate Audio] Playback started (sync)');
        resolve();
        return;
      }

      playPromise
        .then(() => {
          if (this.currentRequestId !== requestId) {
            // A newer play() request arrived while we were waiting for this one to start.
            // Pause this audio cleanly — the new request already called stop().
            if (DEV) console.log('[SahiRate Audio] Playback superseded, pausing.');
            try {
              audio.pause();
              audio.removeAttribute('src');
              audio.load();
            } catch (_) {
              // Ignore cleanup errors
            }
          } else {
            if (DEV) console.log('[SahiRate Audio] Playback started:', url);
          }
          resolve();
        })
        .catch((err: DOMException) => {
          if (err.name === 'AbortError') {
            // Expected: play() was interrupted because stop() was called.
            // This is NOT an error — it's intentional cancellation.
            if (DEV) console.log('[SahiRate Audio] Playback cancelled (AbortError — expected)');
          } else if (err.name === 'NotAllowedError') {
            // Browser autoplay policy: user has not yet interacted with the document,
            // OR the audio is being triggered without a direct user gesture.
            // This should not happen if playAudio() is only called from onClick.
            if (DEV) {
              console.warn(
                '[SahiRate Audio] NotAllowedError — audio was triggered without a user gesture, or autoplay is blocked.'
              );
            }
          } else if (err.name === 'NotSupportedError') {
            // The browser could not decode the media format, or the src was empty/wrong.
            if (DEV) {
              console.warn(`[SahiRate Audio] NotSupportedError — unsupported format or missing file: ${url}`);
            }
          } else {
            // Unexpected error
            if (DEV) {
              console.warn('[SahiRate Audio] Playback error:', err.name, err.message, url);
            }
          }
          resolve();
        });
    });
  }

  stop() {
    this.currentRequestId++;
    if (this.currentAudio) {
      const audio = this.currentAudio;
      this.currentAudio = null;
      try {
        audio.pause();
        audio.removeAttribute('src');
        audio.load();
      } catch (_) {
        // Ignore cleanup errors
      }
      if (DEV) console.log('[SahiRate Audio] Stopped');
    }
  }
}

// Singleton: one audio player for the whole app.
export const audioService = new AudioPlayer();
