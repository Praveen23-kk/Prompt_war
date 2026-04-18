'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Settings, Send, User, FlaskConical, Beaker, Zap, Fingerprint, Search, Menu, X } from 'lucide-react';

interface BlendConfig {
  persona_a: string;
  persona_b: string;
  response_goal: string;
  consistency_mode: boolean;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export default function Home() {
  const [config, setConfig] = useState<BlendConfig>({
    persona_a: 'Sherlock Holmes',
    persona_b: 'Gordon Ramsay',
    response_goal: 'Concise and witty',
    consistency_mode: true,
  });

  const [sessionActive, setSessionActive] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleStartSession = () => {
    if (!config.persona_a.trim() || !config.persona_b.trim()) {
      setError('Both targets (Persona A and Persona B) must be identified.');
      return;
    }
    setError('');
    setSessionActive(true);
    setMessages([]);
    setSidebarOpen(false);
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || !sessionActive || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config,
          messages: [...messages, { role: 'user', content: userMessage }],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch response');
      }

      setMessages((prev) => [...prev, { role: 'assistant', content: data.answer }]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-background text-foreground scanlines font-sans">
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Investigation Setup */}
      <aside className={`fixed md:relative z-50 w-80 h-full flex-shrink-0 flex flex-col glass-panel border-r border-border transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-6 border-b border-border flex justify-between items-center bg-black/20">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2 text-primary tracking-widest uppercase text-sm">
              <Fingerprint className="w-5 h-5" />
              Project Merge
            </h1>
            <p className="text-xs text-muted-foreground mt-2 font-mono">
              STATUS: SECURE TERMINAL
            </p>
          </div>
          <button className="md:hidden text-muted-foreground hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 form-controls">
          <div className="space-y-5">
            <h2 className="text-sm font-semibold text-secondary uppercase tracking-widest flex items-center gap-2 font-mono">
              <Settings className="w-4 h-4" /> Parameters
            </h2>

            <div>
              <label className="block text-xs font-mono text-primary mb-1.5 uppercase tracking-wider">Subject Alpha</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={config.persona_a}
                  onChange={(e) => setConfig({ ...config, persona_a: e.target.value })}
                  disabled={sessionActive}
                  className="w-full bg-input border-b-2 border-transparent border-b-muted-foreground/30 bg-black/30 pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:border-b-primary focus:bg-black/50 disabled:opacity-50 transition-all text-white font-mono"
                  placeholder="e.g. Sherlock Holmes"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-primary mb-1.5 uppercase tracking-wider">Subject Beta</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={config.persona_b}
                  onChange={(e) => setConfig({ ...config, persona_b: e.target.value })}
                  disabled={sessionActive}
                  className="w-full bg-input border-b-2 border-transparent border-b-muted-foreground/30 bg-black/30 pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:border-b-secondary focus:bg-black/50 disabled:opacity-50 transition-all text-white font-mono"
                  placeholder="e.g. Gordon Ramsay"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-muted-foreground mb-1.5 uppercase tracking-wider">Objective</label>
              <textarea
                value={config.response_goal}
                onChange={(e) => setConfig({ ...config, response_goal: e.target.value })}
                disabled={sessionActive}
                className="w-full bg-input border-b-2 border-transparent border-b-muted-foreground/30 bg-black/30 p-3 text-sm focus:outline-none focus:border-b-accent focus:bg-black/50 disabled:opacity-50 transition-all min-h-[80px] text-white font-mono resize-none"
                placeholder="Optional goal... e.g. Interrogate the suspect"
              />
            </div>

            <label className="flex items-center gap-3 cursor-pointer group mt-4 border border-border p-3 rounded bg-black/20 hover:bg-black/40 transition-colors">
              <div className="relative flex items-center justify-center w-5 h-5 border border-muted-foreground bg-input rounded-sm overflow-hidden">
                <input
                  type="checkbox"
                  checked={config.consistency_mode}
                  onChange={(e) => setConfig({ ...config, consistency_mode: e.target.checked })}
                  disabled={sessionActive}
                  className="peer sr-only"
                />
                <div className="w-full h-full peer-checked:bg-primary transition-colors flex items-center justify-center">
                  {config.consistency_mode && <Zap className="w-3 h-3 text-primary-foreground" />}
                </div>
              </div>
              <span className="text-xs font-mono text-muted-foreground group-hover:text-foreground transition-colors line-clamp-1 uppercase tracking-wider">
                Strict Cohesion
              </span>
            </label>
          </div>
        </div>

        <div className="p-6 border-t border-border bg-black/40">
          {sessionActive ? (
            <button
              onClick={() => setSessionActive(false)}
              className="w-full py-3 bg-secondary text-secondary-foreground rounded text-xs font-bold hover:bg-secondary/80 transition-all glow-secondary border border-secondary flex justify-center items-center gap-2 uppercase tracking-widest font-mono"
            >
              <Settings className="w-4 h-4" /> Reset Intel
            </button>
          ) : (
            <button
              onClick={handleStartSession}
              className="w-full py-3 bg-primary text-primary-foreground rounded text-xs font-bold hover:bg-primary/90 transition-all glow-primary flex items-center justify-center gap-2 uppercase tracking-widest font-mono"
            >
              <Beaker className="w-4 h-4" /> Merge Subjects
            </button>
          )}
        </div>
      </aside>

      {/* Main Content Area - Log Database */}
      <main className="flex-1 flex flex-col min-w-0 z-10 relative h-full">
        <header className="h-16 border-b border-border glass-panel bg-opacity-40 flex items-center px-4 md:px-6 justify-between flex-shrink-0 relative">
          <div className="flex items-center gap-3">
            <button className="md:hidden p-2 text-muted-foreground hover:text-primary rounded" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-5 h-5" />
            </button>
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_var(--primary)]"></div>
            <h2 className="font-mono text-xs md:text-sm tracking-widest text-primary font-bold">
              {sessionActive ? 'ACTIVE CASE LOG' : 'SYSTEM STANDBY'}
            </h2>
          </div>
          {sessionActive && (
            <div className="flex items-center gap-2 md:gap-4 p-1.5 md:p-2 rounded bg-black/60 border border-border">
              <span className="text-[10px] md:text-xs font-mono text-primary flex items-center gap-1.5">
                 <span className="opacity-50 hidden md:inline">V:</span> <span className="truncate max-w-[80px] md:max-w-[150px]">{config.persona_a}</span>
              </span>
              <span className="text-[10px] md:text-xs font-mono text-muted-foreground">x</span>
              <span className="text-[10px] md:text-xs font-mono text-secondary flex items-center gap-1.5">
                 <span className="opacity-50 hidden md:inline">V:</span> <span className="truncate max-w-[80px] md:max-w-[150px]">{config.persona_b}</span>
              </span>
            </div>
          )}
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 bg-gradient-to-b from-transparent to-black/30" id="chat-container">
          {!sessionActive && (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-6">
              <div className="w-24 h-24 rounded border-2 border-primary/20 flex items-center justify-center bg-primary/5 glow-primary relative overflow-hidden group">
                <Search className="w-12 h-12 text-primary absolute opacity-10 group-hover:scale-110 transition-transform duration-500" />
                <FlaskConical className="w-10 h-10 text-primary relative z-10" />
              </div>
              <h3 className="text-xl font-bold tracking-widest font-display text-white uppercase">Awaiting Parameters</h3>
              <p className="text-sm text-muted-foreground font-mono leading-relaxed border-l-2 border-primary/50 pl-4 py-1 text-left">
                SYSTEM READY. Initialize the subject merge from the control panel to begin encrypted analysis protocol.
              </p>
            </div>
          )}

          {sessionActive && messages.length === 0 && (
            <div className="flex justify-center my-8">
              <span className="px-4 py-2 border border-primary/30 rounded bg-primary/10 text-xs font-mono text-primary uppercase tracking-widest">
                Connection Secured. Begin Inquiry.
              </span>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} group`}
            >
              <div className={`flex flex-col gap-1.5 max-w-[90%] md:max-w-[75%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className="flex items-center gap-2 px-1">
                  <span className={`text-[10px] uppercase tracking-widest font-mono font-bold ${msg.role === 'user' ? 'text-secondary' : 'text-primary'}`}>
                    {msg.role === 'user' ? 'Investigator' : 'The Entity'}
                  </span>
                </div>
                <div
                  className={`p-4 md:p-5 text-sm md:text-base leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-secondary/10 border-r-2 border-secondary text-white shadow-[0_4px_20px_rgba(255,183,3,0.05)] text-right'
                      : 'bg-black/40 border-l-2 border-primary text-[#e3dcf0] shadow-[0_4px_20px_rgba(0,240,255,0.05)]'
                  } transition-all duration-300 backdrop-blur-sm relative overload-hidden`}
                >
                  <p className="whitespace-pre-wrap relative z-10">{msg.content}</p>
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-black/40 border-l-2 border-primary p-4 flex items-center gap-4 w-fit backdrop-blur-sm">
                <div className="flex gap-1.5">
                  <span className="w-1.5 h-4 bg-primary animate-pulse [animation-delay:-0.3s]"></span>
                  <span className="w-1.5 h-4 bg-primary animate-pulse [animation-delay:-0.15s]"></span>
                  <span className="w-1.5 h-4 bg-primary animate-pulse"></span>
                </div>
                <span className="text-xs font-mono text-primary tracking-widest uppercase">Synthesizing...</span>
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 border-l-2 border-destructive bg-destructive/10 text-destructive text-sm flex gap-3 items-start animate-in fade-in slide-in-from-bottom-2">
              <span className="font-mono mt-0.5 font-bold">ERR:</span>
              <p>{error}</p>
            </div>
          )}
          <div ref={messagesEndRef} className="h-4" />
        </div>

        <div className="p-4 md:p-6 border-t border-border bg-black/60 backdrop-blur relative z-20">
          <form
            onSubmit={handleSendMessage}
            className="max-w-4xl mx-auto relative flex items-center group"
          >
            <div className="absolute left-4 w-2 h-2 rounded-full bg-secondary shadow-[0_0_8px_rgba(255,183,3,0.6)]"></div>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={!sessionActive || loading}
              placeholder={sessionActive ? "Initiate query sequence..." : "Terminal Offline"}
              className="w-full bg-[#0d0d12]/80 border border-border pl-10 pr-14 py-4 text-sm md:text-base focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary disabled:opacity-50 transition-all font-mono text-white placeholder:text-muted-foreground/50 shadow-inner"
            />
            <button
              type="submit"
              disabled={!input.trim() || !sessionActive || loading}
              className="absolute right-2 p-2.5 bg-secondary text-secondary-foreground hover:bg-secondary/90 disabled:opacity-20 disabled:bg-muted-foreground transition-all flex items-center justify-center glow-secondary border border-transparent hover:border-white/20"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
