import Anthropic from '@anthropic-ai/sdk';
import type { LogEntry, AgentConfig } from '../types';

const STRUDEL_SYSTEM_PROMPT = `You are an AI music composer that creates music using Strudel, a live coding language for algorithmic music.

Strudel is based on Tidal Cycles and uses a pattern-based approach. Here are the basics:

Key Concepts:
- Use note() to create melodic patterns: note("c3 e3 g3")
- Use sound() for samples: sound("bd sd bd sd")
- Use s() as shorthand for sound: s("bd sd")
- Chain methods with .: note("c a f e").sound("piano")
- Use * for rhythm subdivision: "bd*4" plays bd 4 times
- Use [] for grouping: "[bd sd] hh"
- Use <> for alternation: "<bd sd>" alternates between patterns
- Use : for sample selection: s("bd:0 bd:1")

Common parameters:
- .speed() - playback speed/pitch
- .gain() - volume
- .pan() - stereo position (0=left, 1=right)
- .cutoff() - filter cutoff
- .resonance() - filter resonance
- .delay() - delay amount
- .room() - reverb
- .lpf() / .hpf() - low/high pass filter
- .n() - note as number (0=C)

Structure:
- Use .slow() to slow down patterns
- Use .fast() to speed up patterns
- Use .every() for conditional changes: .every(4, x => x.speed(2))
- Use .sometimesBy() for probability: .sometimesBy(0.5, x => x.gain(0.5))
- Stack patterns with stack(): stack(s("bd"), s("hh*4"))

Your task: Generate Strudel code that matches the user's prompt. Always respond in this exact JSON format:
{
  "strudelCode": "the complete strudel code",
  "description": "brief description of what you changed",
  "structuralNotes": "any important structural decisions (key, tempo, form, etc)"
}

Build progressively on previous versions. Start simple and add complexity over iterations.`;

export class MusicAgent {
  private client: Anthropic;
  private config: AgentConfig;
  private abortController: AbortController | null = null;

  constructor(config: AgentConfig) {
    this.config = config;
    this.client = new Anthropic({
      apiKey: config.apiKey,
      dangerouslyAllowBrowser: true, // For local development only
    });
  }

  async generateNextIteration(
    prompt: string,
    currentCode: string,
    previousLogs: LogEntry[]
  ): Promise<LogEntry> {
    const conversationHistory = this.buildConversationContext(previousLogs);

    const userMessage = currentCode
      ? `Current Strudel code:\n\`\`\`javascript\n${currentCode}\n\`\`\`\n\nUser prompt: "${prompt}"\n\nGenerate the next iteration of this music, building on what exists.`
      : `User prompt: "${prompt}"\n\nGenerate the initial Strudel code to start building this music.`;

    try {
      const response = await this.client.messages.create({
        model: this.config.model || 'claude-sonnet-4-5-20250929',
        max_tokens: 2000,
        system: STRUDEL_SYSTEM_PROMPT,
        messages: [
          ...conversationHistory,
          { role: 'user', content: userMessage }
        ],
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type');
      }

      const parsed = this.parseResponse(content.text);

      return {
        timestamp: new Date(),
        description: parsed.description,
        strudelCode: parsed.strudelCode,
        structuralNotes: parsed.structuralNotes,
      };
    } catch (error) {
      console.error('Error generating iteration:', error);
      throw error;
    }
  }

  private parseResponse(text: string): { strudelCode: string; description: string; structuralNotes?: string } {
    try {
      // Try to extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed;
      }

      // Fallback: try to extract code blocks
      const codeMatch = text.match(/```(?:javascript|js)?\n([\s\S]*?)\n```/);
      const strudelCode = codeMatch ? codeMatch[1].trim() : text;

      return {
        strudelCode,
        description: 'Generated new pattern',
        structuralNotes: undefined,
      };
    } catch (error) {
      console.error('Error parsing response:', error);
      return {
        strudelCode: text,
        description: 'Generated new pattern',
        structuralNotes: undefined,
      };
    }
  }

  private buildConversationContext(logs: LogEntry[]): Array<{ role: 'user' | 'assistant'; content: string }> {
    // Include last few iterations as context
    const recentLogs = logs.slice(-3);
    const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [];

    for (const log of recentLogs) {
      messages.push({
        role: 'assistant',
        content: JSON.stringify({
          strudelCode: log.strudelCode,
          description: log.description,
          structuralNotes: log.structuralNotes,
        }),
      });
    }

    return messages;
  }

  abort() {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }
}
