# AI Music Agent with Strudel

An AI-powered music composition system that uses Claude to iteratively create and evolve music using the Strudel live coding language.

## Overview

This project creates an autonomous AI agent that composes music by:
- Taking a user-provided prompt describing the desired song (e.g., "minimalist hyperpop anthem")
- Iteratively generating and refining Strudel code
- Playing the generated music in real-time through the browser
- Maintaining a log of all modifications with timestamps and structural notes

## Features

- **AI-Driven Composition**: Uses Claude to generate Strudel code based on your prompt
- **Continuous Evolution**: Agent runs in a loop, continuously refining and building upon previous iterations
- **Real-Time Playback**: Music plays immediately as each iteration is generated
- **Modification Log**: Track all changes with timestamps, descriptions, and structural notes
- **Interactive Controls**: Start, stop, and reset the composition process at any time
- **Configurable Iteration Timing**: Adjust how long the agent waits between modifications

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- An Anthropic API key (get one at https://console.anthropic.com/)

### Installation

1. Clone this repository:
```bash
git clone <repository-url>
cd strudel-bot
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to the URL shown in the terminal (typically http://localhost:5173)

### Configuration

1. **API Key**: Enter your Anthropic API key in the "Anthropic API Key" field
   - For local testing, you can hardcode it in `src/App.tsx` by changing the `DEFAULT_API_KEY` constant
   - **Warning**: Never commit hardcoded API keys to version control

2. **Iteration Delay**: Set how many milliseconds the agent waits between generating new iterations (default: 5000ms)

## Usage

1. Enter your Anthropic API key (if not hardcoded)
2. Enter a song description in the "Song Description" field
   - Examples:
     - "minimalist hyperpop anthem"
     - "jazz fusion with glitchy beats"
     - "ambient soundscape with evolving textures"
     - "808-driven trap beat with melodic elements"

3. Click "Start" to begin the composition process
4. Watch as the AI generates code and the music evolves
5. Click "Stop" to pause the agent
6. Click "Reset" to clear the current composition and start fresh

## How It Works

### Agent Loop

The agent operates in a continuous loop:

1. **Generate**: Claude analyzes the current code, prompt, and previous modifications to generate the next iteration
2. **Evaluate**: The new Strudel code is evaluated and played through the Web Audio API
3. **Log**: The modification is logged with a timestamp and description
4. **Repeat**: After the configured delay, the loop continues

### Strudel Integration

Strudel is a live coding language for making music. The agent has knowledge of:
- Pattern notation (e.g., `note("c3 e3 g3")`)
- Sample playback (e.g., `sound("bd sd hh")`)
- Effects and transformations (e.g., `.slow()`, `.fast()`, `.every()`)
- Musical structure and composition techniques

### System Prompt

The agent includes a comprehensive system prompt that teaches Claude about:
- Strudel syntax and patterns
- Common musical parameters
- Structural techniques for building compositions
- Best practices for generating valid code

## Project Structure

```
strudel-bot/
├── src/
│   ├── services/
│   │   ├── aiAgent.ts         # Claude API integration and agent loop
│   │   └── strudelService.ts  # Strudel evaluation and audio playback
│   ├── types.ts               # TypeScript type definitions
│   ├── strudel.d.ts           # Type declarations for Strudel packages
│   ├── App.tsx                # Main application component
│   ├── App.css                # Application styles
│   └── main.tsx               # Application entry point
├── package.json
└── README.md
```

## Development

### Build

```bash
npm run build
```

### Type Checking

```bash
npm run build
```

### Linting

```bash
npm run lint
```

## Extending the System

### Adding Strudel Skills

To enhance the agent's Strudel knowledge:

1. Add your Strudel skill documentation to `src/services/aiAgent.ts`
2. Update the `STRUDEL_SYSTEM_PROMPT` with additional syntax and examples
3. Rebuild the project

### Customizing the Agent

You can customize the agent's behavior by modifying:

- **Model**: Change the `model` parameter in `aiAgent.ts` (line 68)
- **Max Tokens**: Adjust `max_tokens` for longer/shorter responses (line 69)
- **Context Window**: Modify `buildConversationContext()` to include more/fewer previous iterations (line 101)

### UI Customization

The interface is fully customizable through `src/App.css`. The design uses:
- CSS Grid for responsive layouts
- Gradient backgrounds
- Smooth animations
- Dark theme optimized for music production

## Troubleshooting

### Audio Not Playing

- Make sure you've clicked "Start" at least once to initialize audio (browser security requirement)
- Check browser console for errors
- Ensure your browser supports Web Audio API

### Agent Errors

- Verify your API key is correct
- Check the browser console for detailed error messages
- Ensure you have a stable internet connection

### Type Errors

- Run `npm install` to ensure all dependencies are installed
- The project includes custom type declarations for Strudel packages in `src/strudel.d.ts`

## Technologies Used

- **React** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Strudel** - Live coding music language
- **Anthropic SDK** - Claude API integration
- **Web Audio API** - Audio playback

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
