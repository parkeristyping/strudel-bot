// Declare the strudel-editor custom element type
declare global {
  interface HTMLElementTagNameMap {
    'strudel-editor': StrudelEditor;
  }
}

interface StrudelEditor extends HTMLElement {
  editor: {
    setCode: (code: string) => void;
    start: () => void;
    stop: () => void;
    evaluate: () => Promise<void>;
  };
  setAttribute: (name: string, value: string) => void;
}

export class StrudelService {
  private editorElement: StrudelEditor | null = null;
  private isInitialized = false;

  async initialize() {
    if (this.isInitialized && this.editorElement) return;

    // Create the strudel-editor element
    this.editorElement = document.createElement('strudel-editor') as StrudelEditor;

    // Set initial empty code
    this.editorElement.setAttribute('code', '');

    // Hide the editor (we only need the audio engine, not the visual editor)
    this.editorElement.style.display = 'none';

    // Append to body
    document.body.appendChild(this.editorElement);

    // Wait a bit for the editor to initialize
    await new Promise(resolve => setTimeout(resolve, 500));

    this.isInitialized = true;
  }

  async evaluateCode(code: string) {
    try {
      if (!this.isInitialized || !this.editorElement) {
        await this.initialize();
      }

      if (!this.editorElement?.editor) {
        throw new Error('Strudel editor not properly initialized');
      }

      // Set the new code
      this.editorElement.editor.setCode(code);

      // Evaluate and start playback
      await this.editorElement.editor.evaluate();
      this.editorElement.editor.start();

      return { success: true };
    } catch (error) {
      console.error('Error evaluating Strudel code:', error);
      return { success: false, error: String(error) };
    }
  }

  stop() {
    if (this.editorElement?.editor) {
      this.editorElement.editor.stop();
    }
  }

  isPlaying(): boolean {
    // For now, we'll track this separately since the web component
    // doesn't expose a direct isPlaying() method
    return this.isInitialized && this.editorElement !== null;
  }
}

export const strudelService = new StrudelService();
