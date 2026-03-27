'use client';

import { useState } from 'react';
import { fetchJSON } from '@/lib/openrouter';
import { Plus, Trash2, CheckSquare, ArrowUp, Lightbulb } from 'lucide-react';

interface TaskItem {
  name: string;
}

interface PrioritizedTask {
  name: string;
  priority: 'high' | 'medium' | 'low';
  reason: string;
}

interface TaskResult {
  prioritized_tasks: PrioritizedTask[];
  suggestions: string[];
}

const PRIORITY_STYLE: Record<
  'high' | 'medium' | 'low',
  { bg: string; border: string; text: string; dot: string; badge: string }
> = {
  high: {
    bg: 'bg-red-500/8',
    border: 'border-red-500/18',
    text: 'text-red-400',
    dot: 'bg-red-400',
    badge: 'bg-red-500/12 text-red-400 border-red-500/20',
  },
  medium: {
    bg: 'bg-amber-500/8',
    border: 'border-amber-500/18',
    text: 'text-amber-400',
    dot: 'bg-amber-400',
    badge: 'bg-amber-500/12 text-amber-400 border-amber-500/20',
  },
  low: {
    bg: 'bg-blue-500/8',
    border: 'border-blue-500/18',
    text: 'text-blue-400',
    dot: 'bg-blue-400',
    badge: 'bg-blue-500/12 text-blue-400 border-blue-500/20',
  },
};

const QUICK_LOADS = [
  {
    label: 'Sprint Planning',
    context: '5-person software team, 2-week sprint, release on April 5th',
    tasks: ['Write unit tests', 'Design REST endpoints', 'Fix login bug', 'Update documentation', 'Deploy to staging'],
  },
  {
    label: 'Event Prep',
    context: 'College tech fest committee, event in 2 weeks, ~500 attendees expected',
    tasks: ['Book venue', 'Confirm keynote speakers', 'Design promo posters', 'Open registration portal', 'Arrange catering'],
  },
];

export default function TaskManager() {
  const [tasks, setTasks] = useState<TaskItem[]>([{ name: '' }]);
  const [context, setContext] = useState('');
  const [result, setResult] = useState<TaskResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addTask = () => setTasks((prev) => [...prev, { name: '' }]);
  const removeTask = (i: number) =>
    setTasks((prev) => prev.filter((_, idx) => idx !== i));
  const updateTask = (i: number, val: string) =>
    setTasks((prev) => prev.map((t, idx) => (idx === i ? { name: val } : t)));

  const loadQuick = (q: (typeof QUICK_LOADS)[0]) => {
    setContext(q.context);
    setTasks(q.tasks.map((name) => ({ name })));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const valid = tasks.filter((t) => t.name.trim());
    if (valid.length === 0) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    const system = `You are an expert project manager and productivity coach. Prioritize the given tasks and return actionable suggestions.
Return ONLY valid JSON — no markdown, no extra text — in exactly this shape:
{
  "prioritized_tasks": [
    { "name": "task name", "priority": "high|medium|low", "reason": "one-line reason" }
  ],
  "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"]
}`;

    const user = `Tasks to prioritize:\n${valid
      .map((t, i) => `${i + 1}. ${t.name}`)
      .join('\n')}${context ? `\n\nContext: ${context}` : ''}`;

    try {
      const res = await fetchJSON<TaskResult>(system, user);
      setResult(res);
    } catch {
      setError('Failed to prioritize tasks. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* ── Input ── */}
      <div className="glass-card p-5 flex flex-col space-y-5">
        <div className="flex items-center gap-2">
          <div className="w-1 h-4 rounded-full bg-gradient-to-b from-orange-400 to-amber-500" />
          <h3 className="font-semibold text-[13px] text-white/85">Task List</h3>
        </div>

        {/* Quick load */}
        <div>
          <span className="label-text">Quick Load</span>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_LOADS.map((q) => (
              <button key={q.label} onClick={() => loadQuick(q)} className="chip">
                {q.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 flex-1 flex flex-col">
          <div className="flex-1">
            <span className="label-text">Tasks</span>
            <div className="space-y-2">
              {tasks.map((task, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-[11px] text-white/28 w-5 text-right shrink-0">
                    {i + 1}
                  </span>
                  <input
                    type="text"
                    value={task.name}
                    onChange={(e) => updateTask(i, e.target.value)}
                    placeholder={`Task ${i + 1}`}
                    className="glass-input flex-1 px-3 py-2 text-sm"
                  />
                  {tasks.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTask(i)}
                      className="p-1.5 rounded-lg text-white/25 hover:text-red-400 hover:bg-red-500/8 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addTask}
              className="mt-2.5 flex items-center gap-1.5 text-[11px] text-white/35 hover:text-white/65 transition-colors"
            >
              <Plus className="w-3 h-3" />
              Add Task
            </button>
          </div>

          <div>
            <span className="label-text">Team / Project Context</span>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="e.g., 5-person team, mobile app launch next week, critical deadline…"
              rows={3}
              className="glass-input px-3 py-2 text-sm resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || tasks.every((t) => !t.name.trim())}
            className="btn-gradient w-full py-2.5 text-sm flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Prioritizing…
              </>
            ) : (
              <>
                <ArrowUp className="w-3.5 h-3.5" />
                Prioritize Tasks
              </>
            )}
          </button>
        </form>
      </div>

      {/* ── Results ── */}
      <div className="glass-card p-5 flex flex-col space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-1 h-4 rounded-full bg-gradient-to-b from-amber-400 to-orange-500" />
          <h3 className="font-semibold text-[13px] text-white/85">Prioritized Results</h3>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-500/8 border border-red-500/18 text-red-400 text-[12px]">
            {error}
          </div>
        )}

        {result ? (
          <div className="space-y-5 overflow-y-auto animate-fadeInUp">
            {/* Priority list */}
            <div>
              <span className="label-text">Priority Order</span>
              <div className="space-y-2">
                {result.prioritized_tasks.map((task, i) => {
                  const style = PRIORITY_STYLE[task.priority] ?? PRIORITY_STYLE.low;
                  return (
                    <div
                      key={i}
                      className={`flex items-start gap-3 p-3 rounded-xl border ${style.bg} ${style.border}`}
                    >
                      <div className="flex items-center gap-2 shrink-0 pt-0.5">
                        <span className="text-[10px] font-bold text-white/30 w-4 text-right">
                          {i + 1}
                        </span>
                        <div className={`w-2 h-2 rounded-full shrink-0 ${style.dot}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-white/82 truncate">
                          {task.name}
                        </p>
                        {task.reason && (
                          <p className="text-[11px] text-white/38 mt-0.5">{task.reason}</p>
                        )}
                      </div>
                      <span
                        className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border shrink-0 ${style.badge}`}
                      >
                        {task.priority}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Suggestions */}
            {result.suggestions && result.suggestions.length > 0 && (
              <div>
                <span className="label-text">AI Suggestions</span>
                <div className="space-y-2">
                  {result.suggestions.map((s, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2.5 p-3 rounded-xl bg-violet-500/5 border border-violet-500/12"
                    >
                      <Lightbulb className="w-3.5 h-3.5 text-violet-400/55 mt-0.5 shrink-0" />
                      <p className="text-[12px] text-white/60">{s}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500/12 to-amber-500/12 border border-orange-500/15 flex items-center justify-center mb-3">
              <CheckSquare className="w-5 h-5 text-orange-400/45" />
            </div>
            <p className="text-[12px] text-white/22">
              Add your tasks and get AI-powered prioritization
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
