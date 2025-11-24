import { useState, useEffect, useRef } from 'react';
import { MusicAgent } from './services/aiAgent';
import { strudelService } from './services/strudelService';
import type { AgentState } from './types';
import './App.css';

const DEFAULT_ITERATION_DELAY = 5000; // 5 seconds between iterations
const DEFAULT_API_KEY = 'your-api-key-here'; // Replace with your API key

function App() {
  const [state, setState] = useState<AgentState>({
    isRunning: false,
    currentCode: '',
    prompt: '',
    logs: [],
  });
  const [apiKey, setApiKey] = useState(DEFAULT_API_KEY);
  const [iterationDelay, setIterationDelay] = useState(DEFAULT_ITERATION_DELAY);
  const agentRef = useRef<MusicAgent | null>(null);
  const loopRef = useRef<number | null>(null);

  useEffect(() => {
    // Initialize Strudel on mount
    strudelService.initialize();
  }, []);

  const runAgentLoop = async () => {
    if (!agentRef.current || !state.isRunning) return;

    try {
      const newLog = await agentRef.current.generateNextIteration(
        state.prompt,
        state.currentCode,
        state.logs
      );

      // Update state with new log and code
      setState(prev => ({
        ...prev,
        currentCode: newLog.strudelCode,
        logs: [...prev.logs, newLog],
      }));

      // Evaluate the new code in Strudel
      const result = await strudelService.evaluate(newLog.strudelCode);

      if (!result.success) {
        console.error('Failed to evaluate Strudel code:', result.error);
      }

      // Schedule next iteration
      if (state.isRunning) {
        loopRef.current = window.setTimeout(runAgentLoop, iterationDelay);
      }
    } catch (error) {
      console.error('Error in agent loop:', error);
      handleStop();
    }
  };

  const handleStart = () => {
    if (!apiKey || apiKey === 'your-api-key-here') {
      alert('Please enter your Anthropic API key');
      return;
    }

    if (!state.prompt.trim()) {
      alert('Please enter a prompt');
      return;
    }

    // Create new agent instance
    agentRef.current = new MusicAgent({
      apiKey,
      iterationDelay,
    });

    setState(prev => ({ ...prev, isRunning: true }));

    // Start the loop
    runAgentLoop();
  };

  const handleStop = () => {
    setState(prev => ({ ...prev, isRunning: false }));

    if (loopRef.current) {
      clearTimeout(loopRef.current);
      loopRef.current = null;
    }

    if (agentRef.current) {
      agentRef.current.abort();
    }

    strudelService.stop();
  };

  const handleReset = () => {
    handleStop();
    setState({
      isRunning: false,
      currentCode: '',
      prompt: state.prompt, // Keep the prompt
      logs: [],
    });
  };

  useEffect(() => {
    // Run agent loop when running state changes
    if (state.isRunning) {
      runAgentLoop();
    }
  }, [state.isRunning]);

  return (
    <div className="app">
      <header>
        <h1>🎵 AI Music Agent with Strudel</h1>
      </header>

      <main>
        <div className="config-panel">
          <div className="input-group">
            <label htmlFor="api-key">Anthropic API Key:</label>
            <input
              id="api-key"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              disabled={state.isRunning}
              placeholder="sk-ant-..."
            />
          </div>

          <div className="input-group">
            <label htmlFor="iteration-delay">Iteration Delay (ms):</label>
            <input
              id="iteration-delay"
              type="number"
              value={iterationDelay}
              onChange={(e) => setIterationDelay(Number(e.target.value))}
              disabled={state.isRunning}
              min="1000"
              step="1000"
            />
          </div>
        </div>

        <div className="prompt-panel">
          <label htmlFor="prompt">Song Description:</label>
          <textarea
            id="prompt"
            value={state.prompt}
            onChange={(e) => setState(prev => ({ ...prev, prompt: e.target.value }))}
            disabled={state.isRunning}
            placeholder="e.g., minimalist hyperpop anthem"
            rows={3}
          />
        </div>

        <div className="controls">
          <button
            onClick={handleStart}
            disabled={state.isRunning}
            className="btn btn-start"
          >
            ▶ Start
          </button>
          <button
            onClick={handleStop}
            disabled={!state.isRunning}
            className="btn btn-stop"
          >
            ⏸ Stop
          </button>
          <button
            onClick={handleReset}
            className="btn btn-reset"
          >
            ↺ Reset
          </button>
        </div>

        <div className="content-grid">
          <div className="code-panel">
            <h2>Current Strudel Code</h2>
            <pre className="code-display">
              <code>{state.currentCode || '// No code yet...'}</code>
            </pre>
          </div>

          <div className="log-panel">
            <h2>Modification Log</h2>
            <div className="log-entries">
              {state.logs.length === 0 ? (
                <p className="empty-state">No modifications yet...</p>
              ) : (
                state.logs.map((log, index) => (
                  <div key={index} className="log-entry">
                    <div className="log-header">
                      <span className="log-timestamp">
                        {log.timestamp.toLocaleTimeString()}
                      </span>
                      <span className="log-iteration">Iteration {index + 1}</span>
                    </div>
                    <div className="log-description">{log.description}</div>
                    {log.structuralNotes && (
                      <div className="log-notes">
                        <strong>Notes:</strong> {log.structuralNotes}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {state.isRunning && (
          <div className="status-indicator">
            <span className="pulse"></span>
            Agent is running...
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
