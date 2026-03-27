'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import WritingAssistant from '@/app/components/WritingAssistant';
import MeetingSummarizer from '@/app/components/MeetingSummarizer';
import ReportGenerator from '@/app/components/ReportGenerator';
import TaskManager from '@/app/components/TaskManager';
import { FileText, Users, BarChart2, CheckSquare, Menu, X, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

const App = () => {
  const [activeAgent, setActiveAgent] = useState('writing-assistant');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const renderAgent = () => {
    switch (activeAgent) {
      case 'writing-assistant':
        return <WritingAssistant />;
      case 'meeting-summarizer':
        return <MeetingSummarizer />;
      case 'report-generator':
        return <ReportGenerator />;
      case 'task-manager':
        return <TaskManager />;
      default:
        return <WritingAssistant />;
    }
  };

  const NavItem = ({ agent, icon, label }) => (
    <Button
      variant={activeAgent === agent ? 'secondary' : 'ghost'}
      className="w-full justify-start"
      onClick={() => setActiveAgent(agent)}>
      {icon}
      {isSidebarOpen && <span className="ml-4">{label}</span>}
    </Button>
  );

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside
        className={`bg-card border-r transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="flex items-center justify-between h-20 px-4 border-b">
          {isSidebarOpen && (
            <h1 className="text-2xl font-bold">OpsAI</h1>
          )}
          <Button variant="ghost" onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2">
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
        </div>
        <nav className="p-4 space-y-2">
          <NavItem agent="writing-assistant" icon={<FileText className="h-5 w-5" />} label="Writing Assistant" />
          <NavItem agent="meeting-summarizer" icon={<Users className="h-5 w-5" />} label="Meeting Summarizer" />
          <NavItem agent="report-generator" icon={<BarChart2 className="h-5 w-5" />} label="Report Generator" />
          <NavItem agent="task-manager" icon={<CheckSquare className="h-5 w-5" />} label="Task Manager" />
        </nav>
        <div className="absolute bottom-0 w-full p-4 border-t">
          <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
            {isSidebarOpen && <span className="ml-4">Logout</span>}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-col flex-1">
        <header className="flex items-center justify-between h-20 px-8 border-b">
          <div>
            <h2 className="text-3xl font-bold">AI Content & Operations Assistant</h2>
            <p className="text-muted-foreground">Your multi-agent AI productivity platform</p>
          </div>
        </header>
        <main className="flex-1 p-8 overflow-y-auto">
          {renderAgent()}
        </main>
      </div>
    </div>
  );
};

export default App;
