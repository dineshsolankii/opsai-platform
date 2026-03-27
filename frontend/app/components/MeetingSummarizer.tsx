'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Loader } from 'lucide-react';

const MeetingSummarizer = () => {
  const [transcript, setTranscript] = useState('');
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [taskId, setTaskId] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSummary(null);
    setTaskId(null);

    const token = localStorage.getItem('token');
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/meeting-summarizer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ transcript }),
    });

    if (response.ok) {
      const data = await response.json();
      setTaskId(data.task_id);
    } else {
      setError('Failed to start summarization');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (taskId) {
      const interval = setInterval(async () => {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tasks/${taskId}`);
        const data = await res.json();
        if (data.status === 'SUCCESS') {
          setSummary(JSON.parse(data.result));
          setIsLoading(false);
          clearInterval(interval);
        } else if (data.status === 'FAILURE') {
          setError('Summarization failed');
          setIsLoading(false);
          clearInterval(interval);
        }
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [taskId]);

  return (
    <div>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Meeting Summarizer</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              rows={10}
              placeholder="Paste your meeting transcript here..."
            />
            <Button type="submit" disabled={isLoading} className="mt-4 w-full">
              {isLoading ? <Loader className="animate-spin" /> : 'Summarize'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      {summary && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{summary.summary}</p>
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Key Points</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2">
                  {summary.key_points.map((point, index) => (
                    <li key={index}>{point}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Decisions</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2">
                  {summary.decisions.map((decision, index) => (
                    <li key={index}>{decision}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Action Items</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2">
                  {summary.action_items.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeetingSummarizer;
