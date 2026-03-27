'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader, Plus, Trash2 } from 'lucide-react';

const TaskManager = () => {
  const [tasks, setTasks] = useState([{ name: '' }]);
  const [context, setContext] = useState('');
  const [prioritizedTasks, setPrioritizedTasks] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [taskId, setTaskId] = useState(null);

  const handleTaskChange = (index, value) => {
    const newTasks = [...tasks];
    newTasks[index].name = value;
    setTasks(newTasks);
  };

  const addTask = () => {
    setTasks([...tasks, { name: '' }]);
  };

  const removeTask = (index) => {
    const newTasks = tasks.filter((_, i) => i !== index);
    setTasks(newTasks);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setPrioritizedTasks(null);
    setTaskId(null);

    const token = localStorage.getItem('token');
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/task-manager`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ tasks, context }),
    });

    if (response.ok) {
      const data = await response.json();
      setTaskId(data.task_id);
    } else {
      setError('Failed to start task prioritization');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (taskId) {
      const interval = setInterval(async () => {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tasks/${taskId}`);
        const data = await res.json();
        if (data.status === 'SUCCESS') {
          setPrioritizedTasks(JSON.parse(data.result));
          setIsLoading(false);
          clearInterval(interval);
        } else if (data.status === 'FAILURE') {
          setError('Task prioritization failed');
          setIsLoading(false);
          clearInterval(interval);
        }
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [taskId]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Task Manager</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label>Tasks</Label>
              <div className="space-y-2">
                {tasks.map((task, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      type="text"
                      value={task.name}
                      onChange={(e) => handleTaskChange(index, e.target.value)}
                      placeholder={`Task ${index + 1}`}
                    />
                    <Button type="button" variant="destructive" size="icon" onClick={() => removeTask(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addTask} className="mt-2">
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </div>
            <div className="space-y-2">
              <Label htmlFor="context">Project/Team Context</Label>
              <Textarea id="context" value={context} onChange={(e) => setContext(e.target.value)} placeholder="e.g., We are a team of 5 working on a new mobile app..." />
            </div>
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? <Loader className="animate-spin" /> : 'Prioritize Tasks'}
            </Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Prioritized Tasks & Suggestions</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <div className="text-red-500 mb-4">{error}</div>}
          {prioritizedTasks && (
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold mb-2">Priority List</h4>
                <ol className="list-decimal list-inside space-y-2">
                  {prioritizedTasks.prioritized_tasks.map((task, index) => (
                    <li key={index}>{task.name}</li>
                  ))}
                </ol>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-2">Suggestions</h4>
                <div className="p-4 bg-muted rounded-lg space-y-2">
                  {prioritizedTasks.suggestions.map((suggestion, index) => (
                    <p key={index}>{suggestion}</p>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskManager;
