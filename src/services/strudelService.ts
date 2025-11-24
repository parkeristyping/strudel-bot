import { repl } from '@strudel/core';
import { getAudioContext, initAudioOnFirstClick, webaudioOutput } from '@strudel/webaudio';

export class StrudelService {
  private isInitialized = false;
  private currentPattern: any = null;

  async initialize() {
    if (this.isInitialized) return;

    // Initialize audio context on user interaction
    await initAudioOnFirstClick();
    this.isInitialized = true;
  }

  async evaluate(code: string) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Stop current pattern if running
      if (this.currentPattern) {
        this.currentPattern.stop();
      }

      // Evaluate the Strudel code
      const { pattern } = repl({
        defaultOutput: webaudioOutput,
        getTime: () => getAudioContext().currentTime,
      });

      // Execute the code and play
      this.currentPattern = await pattern(code);

      return { success: true };
    } catch (error) {
      console.error('Error evaluating Strudel code:', error);
      return { success: false, error: String(error) };
    }
  }

  stop() {
    if (this.currentPattern) {
      this.currentPattern.stop();
      this.currentPattern = null;
    }
  }

  isPlaying(): boolean {
    return this.currentPattern !== null;
  }
}

export const strudelService = new StrudelService();
