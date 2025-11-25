import { evaluate } from '@strudel/core';
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

  async evaluateCode(code: string) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Stop current pattern if running
      if (this.currentPattern) {
        this.currentPattern.stop();
      }

      // Evaluate the Strudel code using the evaluate function
      const pattern = evaluate(code);

      // Start playing the pattern
      this.currentPattern = pattern.play({
        output: webaudioOutput,
        getTime: () => getAudioContext().currentTime,
      });

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
