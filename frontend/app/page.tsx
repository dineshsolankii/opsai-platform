'use client';

import { useState, type ReactNode } from 'react';
import WritingAssistant from '@/app/components/WritingAssistant';
import MeetingSummarizer from '@/app/components/MeetingSummarizer';
import ReportGenerator from '@/app/components/ReportGenerator';
import TaskManager from '@/app/components/TaskManager';
import { FileText, Users, BarChart2, CheckSquare, Menu, X, Sparkles } from 'lucide-react';

interface Agent {
  id: string;
  label: string;
  icon: React.ElementType;
  gradient: string;
  description: string;
  component: ReactNode;
}

const agents: Agent[] = [
  {
    id: 'writing-assistant',
    label: 'Writing Assistant',
    icon: FileText,
    gradient: 'from-violet-500 to-purple-600',
    description: 'Emails, announcements & social posts',
    component: <WritingAssistant />,
  },
  {
    id: 'meeting-summarizer',
    label: 'Meeting Summarizer',
    icon: Users,
    gradient: 'from-blue-500 to-cyan-500',
    description: 'Extract insights from transcripts',
    component: <MeetingSummarizer />,
  },
  {
    id: 'report-generator',
    label: 'Report Generator',
    icon: BarChart2,
    gradient: 'from-emerald-500 to-teal-500',
    description: 'Structured reports & summaries',
    component: <ReportGenerator />,
  },
  {
    id: 'task-manager',
    label: 'Task Manager',
    icon: CheckSquare,
    gradient: 'from-orange-500 to-amber-500',
    description: 'AI-powered task prioritization',
    component: <TaskManager />,
  },
];

export default function App() {
  const [activeId, setActiveId] = useState('writing-assistant');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const active = agents.find((a) => a.id === activeId)!;

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Ambient background orbs — fixed so they don't participate in flex layout */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden" aria-hidden>
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>

      {/* ── Sidebar ── */}
      <aside
        className={`glass-sidebar relative z-10 flex flex-col shrink-0 transition-all duration-300 ${
          sidebarOpen ? 'w-[240px]' : 'w-[68px]'
        }`}
      >
        {/* Logo row */}
        <div className="flex items-center gap-3 h-16 px-4 border-b border-white/5">
          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/30 shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          {sidebarOpen && (
            <span className="font-bold text-base bg-gradient-to-r from-violet-300 to-indigo-300 bg-clip-text text-transparent tracking-tight">
              OpsAI
            </span>
          )}
          <button
            className="ml-auto p-1.5 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/8 transition-colors"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <X size={15} /> : <Menu size={15} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2.5 space-y-0.5 overflow-y-auto">
          {sidebarOpen && (
            <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-white/25 px-3 pt-2 pb-1.5">
              AI Agents
            </p>
          )}
          {agents.map(({ id, label, icon: Icon, gradient, description }) => {
            const isActive = activeId === id;
            return (
              <button
                key={id}
                onClick={() => setActiveId(id)}
                className={`w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl transition-all duration-200 group text-left ${
                  isActive ? 'bg-white/8' : 'hover:bg-white/5'
                }`}
              >
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br ${gradient} shrink-0 shadow-sm transition-transform group-hover:scale-105`}
                >
                  <Icon className="w-4 h-4 text-white" />
                </div>
                {sidebarOpen && (
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-[13px] font-medium truncate ${
                        isActive ? 'text-white/95' : 'text-white/60'
                      }`}
                    >
                      {label}
                    </p>
                    <p className="text-[10px] text-white/30 truncate">{description}</p>
                  </div>
                )}
                {isActive && sidebarOpen && (
                  <div className="w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        {sidebarOpen && (
          <div className="p-4 border-t border-white/5">
            <p className="text-[9px] text-white/20 text-center leading-relaxed">
              Powered by OpenRouter
              <br />
              GPT-4o-mini
            </p>
          </div>
        )}
      </aside>

      {/* ── Main ── */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top bar */}
        <header className="glass-header relative z-10 flex items-center gap-4 h-16 px-6 shrink-0">
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br ${active.gradient} shadow-md shrink-0`}
          >
            <active.icon className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-[15px] font-semibold text-white/90 leading-none">
              {active.label}
            </h1>
            <p className="text-[11px] text-white/35 mt-0.5">{active.description}</p>
          </div>
          <div className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/8 border border-emerald-500/18">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-semibold text-emerald-400 tracking-wide uppercase">
              AI Ready
            </span>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-5">
          {active.component}
        </main>
      </div>
    </div>
  );
}
