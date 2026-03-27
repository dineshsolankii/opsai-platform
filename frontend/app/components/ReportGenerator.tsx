'use client';

import { useState, useRef } from 'react';
import { streamText } from '@/lib/openrouter';
import { BarChart2, Copy, Check } from 'lucide-react';

const REPORT_TYPES = ['Weekly Progress', 'Event Summary', 'Budget Overview', 'Activity Report'];

const QUICK_TEMPLATES = [
  {
    label: 'Sprint Report',
    type: 'Weekly Progress',
    data: 'Completed 12 user stories, resolved 5 bugs, held 3 design reviews, onboarded 1 new developer.',
    period: 'Sprint 14 — March 18–29',
  },
  {
    label: 'Budget Review',
    type: 'Budget Overview',
    data: 'Total budget: $10,000. Venue: $3,200. Catering: $2,400. Marketing: $1,200. Materials: $400. Remaining: $2,800.',
    period: 'Q1 2024',
  },
  {
    label: 'Hackathon Recap',
    type: 'Event Summary',
    data: '210 attendees, 38 teams, 3 tracks (Web, AI, Mobile), 12 sponsors, 1st prize $5,000, avg rating 4.7/5.',
    period: 'March 22–23, 2024',
  },
];

export default function ReportGenerator() {
  const [reportType, setReportType] = useState('Weekly Progress');
  const [data, setData] = useState('');
  const [timePeriod, setTimePeriod] = useState('');
  const [output, setOutput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const stopRef = useRef(false);

  const wordCount = output.trim() ? output.trim().split(/\s+/).length : 0;

  const applyTemplate = (t: (typeof QUICK_TEMPLATES)[0]) => {
    setReportType(t.type);
    setData(t.data);
    setTimePeriod(t.period);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.trim()) return;

    stopRef.current = false;
    setIsStreaming(true);
    setError(null);
    setOutput('');

    const system = `You are a professional report writer for college clubs and organizations. Generate a well-structured, formal ${reportType} report. Use clear headings (##), bullet points where appropriate, and concise language. Output only the report — no preamble.`;
    const user = `Create a ${reportType} report${timePeriod ? ` for ${timePeriod}` : ''} using this data:\n\n${data}`;

    await streamText(
      system,
      user,
      (chunk) => { if (!stopRef.current) setOutput((prev) => prev + chunk); },
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
          <div className="w-1 h-4 rounded-full bg-gradient-to-b from-emerald-400 to-teal-500" />
          <h3 className="font-semibold text-[13px] text-white/85">Report Setup</h3>
        </div>

        {/* Quick templates */}
        <div>
          <span className="label-text">Quick Templates</span>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_TEMPLATES.map((t) => (
              <button key={t.label} onClick={() => applyTemplate(t)} className="chip">
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 flex-1 flex flex-col">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="label-text">Report Type</span>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="glass-input px-3 py-2 text-sm"
              >
                {REPORT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <span className="label-text">Time Period</span>
              <input
                type="text"
                value={timePeriod}
                onChange={(e) => setTimePeriod(e.target.value)}
                placeholder="e.g., Q1 2024"
                className="glass-input px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="flex-1">
            <span className="label-text">Data & Notes *</span>
            <textarea
              value={data}
              onChange={(e) => setData(e.target.value)}
              placeholder="Paste metrics, notes, bullet points — anything relevant…"
              rows={7}
              required
              className="glass-input px-3 py-2 text-sm resize-none"
            />
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={isStreaming || !data.trim()}
              className="btn-gradient flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
            >
              {isStreaming ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating…
                </>
              ) : (
                <>
                  <BarChart2 className="w-3.5 h-3.5" />
                  Generate Report
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
            <div className="w-1 h-4 rounded-full bg-gradient-to-b from-teal-400 to-emerald-500" />
            <h3 className="font-semibold text-[13px] text-white/85">Formatted Report</h3>
          </div>
          {output && (
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-white/28">{wordCount} words</span>
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
            <pre className="whitespace-pre-wrap font-sans text-[13px] leading-relaxed">
              {output}
            </pre>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center py-10">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/12 to-teal-500/12 border border-emerald-500/15 flex items-center justify-center mb-3">
                <BarChart2 className="w-5 h-5 text-emerald-400/45" />
              </div>
              <p className="text-[12px] text-white/22">
                Fill in the details and generate your report
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
