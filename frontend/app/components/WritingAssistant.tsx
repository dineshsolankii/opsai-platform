'use client';

import { useState, useRef } from 'react';
import { streamText } from '@/lib/openrouter';
import { FileText, Copy, Check, Zap } from 'lucide-react';

const CONTENT_TYPES = ['Email', 'Announcement', 'Social Post', 'Newsletter'];
const TONES = ['Formal', 'Casual', 'Enthusiastic', 'Professional'];

const QUICK_PROMPTS = [
  { label: 'Meeting Invite', contentType: 'Email', topic: 'Weekly team sync next Monday at 10 AM — agenda: project updates and blockers', tone: 'Formal' },
  { label: 'Event Announcement', contentType: 'Announcement', topic: 'Annual tech fest with hackathon, workshops, and live music — registrations open now', tone: 'Enthusiastic' },
  { label: 'Thank You Note', contentType: 'Email', topic: 'Thanking 50 volunteers after a successful charity fundraiser that raised $12,000', tone: 'Casual' },
  { label: 'Club Social Post', contentType: 'Social Post', topic: 'AI & ML workshop this Friday 3 PM — limited seats, free for all students', tone: 'Enthusiastic' },
];

export default function WritingAssistant() {
  const [contentType, setContentType] = useState('Email');
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('Formal');
  const [context, setContext] = useState('');
  const [output, setOutput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const stopRef = useRef(false);

  const wordCount = output.trim() ? output.trim().split(/\s+/).length : 0;

  const applyQuickPrompt = (p: (typeof QUICK_PROMPTS)[0]) => {
    setContentType(p.contentType);
    setTopic(p.topic);
    setTone(p.tone);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    stopRef.current = false;
    setIsStreaming(true);
    setError(null);
    setOutput('');

    const system = `You are an expert content writer for college clubs and organizations. Write polished, ready-to-use content. Output the content directly — no meta-commentary, no labels like "Subject:" or "Here is your email:".`;
    const user = `Write a ${tone.toLowerCase()} ${contentType.toLowerCase()} about:\n${topic}${context ? `\n\nAdditional context:\n${context}` : ''}`;

    await streamText(
      system,
      user,
      (chunk) => {
        if (!stopRef.current) setOutput((prev) => prev + chunk);
      },
      () => setIsStreaming(false),
      (err) => { setError(err); setIsStreaming(false); }
    );
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
      {/* ── Input ── */}
      <div className="glass-card p-5 flex flex-col space-y-5">
        <div className="flex items-center gap-2">
          <div className="w-1 h-4 rounded-full bg-gradient-to-b from-violet-400 to-purple-600" />
          <h3 className="font-semibold text-[13px] text-white/85">Configure</h3>
        </div>

        {/* Quick prompts */}
        <div>
          <span className="label-text">Quick Start</span>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_PROMPTS.map((p) => (
              <button key={p.label} onClick={() => applyQuickPrompt(p)} className="chip">
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 flex-1 flex flex-col">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="label-text">Content Type</span>
              <select
                value={contentType}
                onChange={(e) => setContentType(e.target.value)}
                className="glass-input px-3 py-2 text-sm"
              >
                {CONTENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <span className="label-text">Tone</span>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="glass-input px-3 py-2 text-sm"
              >
                {TONES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <span className="label-text">Topic *</span>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Remind members about the upcoming hackathon"
              className="glass-input px-3 py-2 text-sm"
              required
            />
          </div>

          <div className="flex-1">
            <span className="label-text">Additional Context</span>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Any extra details, constraints, or examples..."
              rows={4}
              className="glass-input px-3 py-2 text-sm resize-none"
            />
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={isStreaming || !topic.trim()}
              className="btn-gradient flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
            >
              {isStreaming ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating…
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5" />
                  Generate
                </>
              )}
            </button>
            {isStreaming && (
              <button
                type="button"
                onClick={() => { stopRef.current = true; setIsStreaming(false); }}
                className="px-4 py-2.5 text-sm rounded-[0.625rem] border border-white/10 text-white/55 hover:text-white/85 hover:border-white/20 transition-colors"
              >
                Stop
              </button>
            )}
          </div>
        </form>
      </div>

      {/* ── Output ── */}
      <div className="glass-card p-5 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 rounded-full bg-gradient-to-b from-indigo-400 to-blue-500" />
            <h3 className="font-semibold text-[13px] text-white/85">Output</h3>
          </div>
          {output && (
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-white/28">
                {wordCount} words
              </span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/4 border border-white/8 text-[11px] text-white/55 hover:text-white/85 hover:bg-white/8 transition-all"
              >
                {copied ? (
                  <Check className="w-3 h-3 text-emerald-400" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-3 p-3 rounded-lg bg-red-500/8 border border-red-500/18 text-red-400 text-[12px]">
            {error}
          </div>
        )}

        <div
          className={`output-card flex-1 p-4 overflow-y-auto ${
            output && isStreaming ? 'cursor-blink' : ''
          }`}
        >
          {output ? (
            <span className="whitespace-pre-wrap">{output}</span>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center py-10">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500/15 to-purple-600/15 border border-violet-500/15 flex items-center justify-center mb-3">
                <FileText className="w-5 h-5 text-violet-400/50" />
              </div>
              <p className="text-[12px] text-white/22">
                Configure your content and click Generate
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
