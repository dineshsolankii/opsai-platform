'use client';

import { useState } from 'react';
import { fetchJSON } from '@/lib/openrouter';
import { ClipboardList, Lightbulb, GitMerge, CheckSquare, Users } from 'lucide-react';

interface MeetingSummary {
  summary: string;
  key_points: string[];
  decisions: string[];
  action_items: string[];
}

const SAMPLE_TRANSCRIPT = `John: Good morning everyone. Today we need to discuss the Q2 product launch.
Sarah: The launch is set for April 15th. We need to finalize the marketing strategy.
John: Marketing, can you prepare a campaign brief by end of this Friday?
Mike: I'll handle that. We also need to finalize the budget — I propose $50,000 total.
Sarah: Agreed. Can we include a social media blitz the week before launch?
John: Yes. Mike owns the budget approval. Sarah coordinates with the social team. Let's sync again Thursday. Meeting adjourned.`;

const QUICK_CONTEXTS = [
  { label: 'Load Sample', transcript: SAMPLE_TRANSCRIPT },
];

export default function MeetingSummarizer() {
  const [transcript, setTranscript] = useState('');
  const [summary, setSummary] = useState<MeetingSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transcript.trim()) return;

    setIsLoading(true);
    setError(null);
    setSummary(null);

    const system = `You are an expert meeting analyst. Extract a clean structured summary from the meeting transcript.
Return ONLY valid JSON — no markdown, no extra text — in exactly this shape:
{
  "summary": "2-3 sentence high-level overview",
  "key_points": ["point 1", "point 2", "point 3"],
  "decisions": ["decision 1", "decision 2"],
  "action_items": ["action 1 (Owner Name)", "action 2 (Owner Name)"]
}`;

    try {
      const result = await fetchJSON<MeetingSummary>(
        system,
        `Meeting transcript:\n\n${transcript}`
      );
      setSummary(result);
    } catch {
      setError('Failed to analyze transcript. Please check your input and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* ── Input ── */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 rounded-full bg-gradient-to-b from-blue-400 to-cyan-500" />
            <h3 className="font-semibold text-[13px] text-white/85">Meeting Transcript</h3>
          </div>
          {QUICK_CONTEXTS.map((q) => (
            <button
              key={q.label}
              onClick={() => setTranscript(q.transcript)}
              className="chip"
            >
              {q.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Paste your meeting transcript here…"
            rows={7}
            className="glass-input px-3 py-2 text-sm resize-none"
          />
          <button
            type="submit"
            disabled={isLoading || !transcript.trim()}
            className="btn-gradient w-full py-2.5 text-sm flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Analyzing…
              </>
            ) : (
              <>
                <ClipboardList className="w-3.5 h-3.5" />
                Analyze Meeting
              </>
            )}
          </button>
        </form>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-500/8 border border-red-500/18 text-red-400 text-[12px]">
          {error}
        </div>
      )}

      {/* ── Results ── */}
      {summary && (
        <div className="space-y-3 animate-fadeInUp">
          {/* Summary banner */}
          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <span className="section-title">Overview</span>
            </div>
            <p className="text-[13px] text-white/72 leading-relaxed">{summary.summary}</p>
          </div>

          {/* 3-column breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="glass-card p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-blue-400" />
                <span className="section-title">Key Points</span>
              </div>
              <ul className="space-y-2">
                {summary.key_points.map((pt, i) => (
                  <li key={i} className="flex items-start gap-2 text-[12px] text-white/62">
                    <span className="mt-1.5 w-1 h-1 rounded-full bg-blue-400/55 shrink-0" />
                    {pt}
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass-card p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-violet-400" />
                <span className="section-title">Decisions</span>
              </div>
              <ul className="space-y-2">
                {summary.decisions.map((d, i) => (
                  <li key={i} className="flex items-start gap-2 text-[12px] text-white/62">
                    <GitMerge className="w-3 h-3 mt-0.5 text-violet-400/55 shrink-0" />
                    {d}
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass-card p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="section-title">Action Items</span>
              </div>
              <ul className="space-y-2">
                {summary.action_items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-[12px] text-white/62">
                    <CheckSquare className="w-3 h-3 mt-0.5 text-emerald-400/55 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!summary && !isLoading && !error && (
        <div className="flex flex-col items-center justify-center py-14 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/12 to-cyan-500/12 border border-blue-500/15 flex items-center justify-center mb-3">
            <Users className="w-6 h-6 text-blue-400/45" />
          </div>
          <p className="text-[12px] text-white/22">
            Paste a transcript and click Analyze Meeting
          </p>
        </div>
      )}
    </div>
  );
}
