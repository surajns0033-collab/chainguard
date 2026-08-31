import React, { useState, useRef, useEffect } from 'react';
import { streamSystemResponse } from '../services/geminiService';
import { Trash2, Mic } from 'lucide-react';

interface Message {
  id: string;
  sender: 'USER' | 'SYSTEM';
  text: string;
  isStreaming?: boolean;
}

export interface TerminalCommand {
  text: string;
  timestamp: number;
}

interface TerminalProps {
  externalCommand?: TerminalCommand | null;
  audioEnabled?: boolean;
}

export const Terminal: React.FC<TerminalProps> = ({ externalCommand, audioEnabled = true }) => {
  const [messages, setMessages] = useState<Message[]>([
    { id: 'init-1', sender: 'SYSTEM', text: '[ INITIALIZATION ]\n| Module | Status | Notes |\n|---|---|---|\n| AI Assistant | ONLINE | Awaiting user input |\n| A2A Gateway | ACTIVE | Secure connection established |' }
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Pre-load voices
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
    }
  }, []);

  // Handle external commands (clicks from other panels)
  useEffect(() => {
    if (externalCommand && externalCommand.text) {
      processCommand(externalCommand.text, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalCommand]);

  const speakText = (text: string) => {
    if (!audioEnabled || !window.speechSynthesis) return;
    
    window.speechSynthesis.cancel(); // Stop any current speech

    // Clean markdown and special characters for better speech
    const cleanText = text
      .replace(/\[.*?\]/g, '') // Remove headers like [ SYSTEM STATUS ]
      .replace(/[*_|-]/g, ' ') // Replace markdown formatting with space
      .replace(/\n/g, '. ') // Replace newlines with periods for pauses
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    const voices = window.speechSynthesis.getVoices();
    // Try to find a British male voice first for that specific feel, fallback to any British voice
    let voice = voices.find(v => v.lang === 'en-GB' && v.name.toLowerCase().includes('male'));
    if (!voice) voice = voices.find(v => v.lang === 'en-GB');
    if (!voice) voice = voices.find(v => v.lang.startsWith('en-')); // Fallback to any English

    if (voice) utterance.voice = voice;
    
    utterance.rate = 1.0;
    utterance.pitch = 0.9;
    
    window.speechSynthesis.speak(utterance);
  };

  const toggleListening = () => {
    // @ts-ignore - SpeechRecognition is not standard in all TS definitions
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input is not supported in this browser.");
      return;
    }

    if (isListening) {
      return; // Let it finish naturally
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-GB';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      processCommand(transcript, true); // Pass true to indicate voice input
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const processCommand = async (cmdText: string, wasSpoken: boolean = false) => {
    if (isProcessing) return;
    setIsProcessing(true);
    
    if (window.speechSynthesis) window.speechSynthesis.cancel();

    const newMessages = [...messages, { id: Date.now().toString(), sender: 'USER' as const, text: cmdText }];
    setMessages(newMessages);

    const systemMsgId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: systemMsgId, sender: 'SYSTEM', text: '', isStreaming: true }]);

    let fullResponse = '';
    try {
      const stream = streamSystemResponse(cmdText);
      
      for await (const chunk of stream) {
        fullResponse += chunk;
        setMessages(prev => prev.map(msg => 
          msg.id === systemMsgId ? { ...msg, text: fullResponse } : msg
        ));
      }
    } catch (error) {
      fullResponse = '[ ERROR ]\n| Component | Status |\n|---|---|\n| Uplink | FAILED |';
      setMessages(prev => prev.map(msg => 
        msg.id === systemMsgId ? { ...msg, text: fullResponse } : msg
      ));
    } finally {
      setMessages(prev => prev.map(msg => 
        msg.id === systemMsgId ? { ...msg, isStreaming: false } : msg
      ));
      setIsProcessing(false);
      // Only speak if the user spoke the command
      if (fullResponse && wasSpoken) {
        speakText(fullResponse);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput('');
    processCommand(userMsg, false); // Pass false for typed input
  };

  const handleClear = () => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setMessages([
      { id: Date.now().toString(), sender: 'SYSTEM', text: '[ SYSTEM ]\n- AI ASSISTANT MEMORY PURGED.\n- AWAITING INPUT...' }
    ]);
  };

  // Colorize specific status keywords without the glow effect
  const applyStatusColors = (str: string) => {
    const regex = /\b(ACTIVE|ONLINE|SUCCESS|OK|NOMINAL|VERIFIED|COMPLETED|ERROR|FAILED|BLOCKED|CRITICAL|DENY|STANDBY|WARNING|PENDING|IDLE)\b/gi;
    const parts = str.split(regex);
    
    return parts.map((part, idx) => {
      const upper = part.toUpperCase();
      if (['ACTIVE', 'ONLINE', 'SUCCESS', 'OK', 'NOMINAL', 'VERIFIED', 'COMPLETED'].includes(upper)) {
        return <span key={idx} className="text-hud-success font-bold">{part}</span>;
      }
      if (['ERROR', 'FAILED', 'BLOCKED', 'CRITICAL', 'DENY'].includes(upper)) {
        return <span key={idx} className="text-hud-alert font-bold">{part}</span>;
      }
      if (['STANDBY', 'WARNING', 'PENDING', 'IDLE'].includes(upper)) {
        return <span key={idx} className="text-hud-warning font-bold">{part}</span>;
      }
      return part;
    });
  };

  // Handle bold text and apply colors
  const colorize = (str: string) => {
    const boldParts = str.split(/(\*\*.*?\*\*)/g);
    return boldParts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const inner = part.slice(2, -2);
        return <strong key={idx} className="text-white font-bold">{applyStatusColors(inner)}</strong>;
      }
      return <span key={idx}>{applyStatusColors(part)}</span>;
    });
  };

  // Advanced formatter for structured HUD output (Tables, Headers, Bullets)
  const formatText = (text: string) => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let inTable = false;
    let tableRows: string[][] = [];

    const renderTable = (rows: string[][], key: number) => {
      if (rows.length === 0) return null;
      const headers = rows[0];
      // Filter out the markdown separator row (e.g., |---|---|)
      const dataRows = rows.slice(1).filter(row => !row.every(cell => cell.match(/^[-:\s]+$/)));

      return (
        <div key={`table-${key}`} className="my-3 overflow-x-auto border border-hud-highlight/30 rounded-sm bg-black/60 shadow-[0_0_10px_rgba(6,182,212,0.1)]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-hud-highlight/20 border-b-2 border-hud-highlight/50">
                {headers.map((h, i) => (
                  <th key={i} className="p-2 text-hud-highlight font-bold tracking-wider text-xs uppercase whitespace-nowrap">
                    {colorize(h)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dataRows.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-b border-hud-border/30 last:border-0 hover:bg-hud-highlight/10 transition-colors">
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className="p-2 text-hud-text/90 text-xs align-top">
                      {colorize(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Table detection
      if (line.includes('|')) {
        inTable = true;
        const cells = line.split('|').map(c => c.trim());
        if (cells[0] === '') cells.shift();
        if (cells[cells.length - 1] === '') cells.pop();
        tableRows.push(cells);
        continue;
      } else if (inTable) {
        // End of table
        elements.push(renderTable(tableRows, i));
        inTable = false;
        tableRows = [];
      }

      if (!line) {
        elements.push(<div key={`space-${i}`} className="h-2"></div>);
        continue;
      }

      // Headers
      const headerMatch = line.match(/^\[(.*?)\]$/);
      if (headerMatch) {
        elements.push(
          <div key={`header-${i}`} className="text-hud-highlight font-bold tracking-widest border-l-2 border-hud-highlight pl-2 mb-2 mt-4 first:mt-0 bg-gradient-to-r from-hud-highlight/20 to-transparent py-1 text-sm">
            {headerMatch[1].toUpperCase()}
          </div>
        );
        continue;
      }

      // Bullets
      if (line.startsWith('- ') || line.startsWith('* ')) {
        elements.push(
          <div key={`bullet-${i}`} className="flex gap-2 mb-1 pl-2 text-sm">
            <span className="text-hud-highlight opacity-70 select-none">▹</span>
            <div className="flex-1">{colorize(line.substring(2))}</div>
          </div>
        );
        continue;
      }

      // Regular text
      elements.push(<div key={`text-${i}`} className="mb-1 leading-relaxed text-sm">{colorize(line)}</div>);
    }

    // Flush remaining table if text ends with a table
    if (inTable) {
      elements.push(renderTable(tableRows, lines.length));
    }

    return elements;
  };

  return (
    <div className="flex flex-col h-full font-mono text-sm min-h-0">
      <div className="flex-1 overflow-y-auto mb-2 pr-2 space-y-4 min-h-0">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.sender === 'USER' ? 'items-end' : 'items-start'}`}>
            <span className={`text-[10px] mb-0.5 opacity-50 ${msg.sender === 'USER' ? 'text-hud-highlight' : 'text-hud-text'}`}>
              {msg.sender === 'USER' ? 'USER' : 'SYS.CORE'}
            </span>
            <div className={`
              p-3 max-w-[98%] break-words
              ${msg.sender === 'USER' 
                ? 'bg-hud-highlight/10 border border-hud-highlight/30 text-hud-highlight' 
                : 'bg-hud-text/5 border border-hud-text/20 text-hud-text'}
            `}>
              {formatText(msg.text)}
              {msg.isStreaming && (
                <span className="animate-pulse inline-block w-2 h-3 bg-hud-highlight ml-1 align-middle mt-1"></span>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSubmit} className="relative flex items-center border border-hud-border bg-black/50 p-1 shrink-0">
        <span className="text-hud-highlight px-2">{'>'}</span>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isProcessing}
          className="flex-1 bg-transparent outline-none text-hud-text placeholder-hud-text/30 text-sm pr-16"
          placeholder="ENTER COMMAND OR QUERY..."
          autoComplete="off"
          spellCheck="false"
        />
        {isProcessing ? (
          <div className="absolute right-2 w-4 h-4 border-2 border-hud-highlight border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <div className="absolute right-2 flex items-center gap-1">
            <button
              type="button"
              onClick={toggleListening}
              className={`p-1 transition-colors ${isListening ? 'text-hud-alert animate-pulse' : 'text-hud-text/50 hover:text-hud-highlight'}`}
              title="Voice Input"
            >
              <Mic className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="text-hud-text/50 hover:text-hud-alert transition-colors p-1"
              title="Clear History"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </form>
    </div>
  );
};
