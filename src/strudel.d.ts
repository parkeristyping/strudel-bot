declare module '@strudel/core' {
  export function repl(config: any): any;
  export const controls: any;
}

declare module '@strudel/webaudio' {
  export function getAudioContext(): AudioContext;
  export function initAudioOnFirstClick(): Promise<void>;
  export const webaudioOutput: any;
}
