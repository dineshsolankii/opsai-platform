'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader, Copy } from 'lucide-react';

const WritingAssistant = () => {
  const [contentType, setContentType] = useState('Email');
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('Formal');
  const [additionalContext, setAdditionalContext] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [taskId, setTaskId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setGeneratedContent('');
    setTaskId(null);

    const token = localStorage.getItem('token');
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/writing-assistant`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ content_type: contentType, topic, tone, additional_context: additionalContext }),
    });

    if (response.ok) {
      const data = await response.json();
      setTaskId(data.task_id);
    } else {
      setError('Failed to start content generation');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (taskId) {
      const interval = setInterval(async () => {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tasks/${taskId}`);
        const data = await res.json();
        if (data.status === 'SUCCESS') {
          setGeneratedContent(data.result);
          setIsLoading(false);
          clearInterval(interval);
        } else if (data.status === 'FAILURE') {
          setError('Content generation failed');
          setIsLoading(false);
          clearInterval(interval);
        }
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [taskId]);

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Writing Assistant</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label>Content Type</Label>
              <Select onValueChange={setContentType} defaultValue={contentType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a content type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Email">Email</SelectItem>
                  <SelectItem value="Announcement">Announcement</SelectItem>
                  <SelectItem value="Social Post">Social Post</SelectItem>
                  <SelectItem value="Newsletter">Newsletter</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="topic">Topic</Label>
              <Input id="topic" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g., Weekly Club Meeting" />
            </div>
            <div className="space-y-2">
              <Label>Tone</Label>
              <Select onValueChange={setTone} defaultValue={tone}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a tone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Formal">Formal</SelectItem>
                  <SelectItem value="Casual">Casual</SelectItem>
                  <SelectItem value="Enthusiastic">Enthusiastic</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="context">Additional Context</Label>
              <Textarea id="context" value={additionalContext} onChange={(e) => setAdditionalContext(e.target.value)} placeholder="e.g., Mention the upcoming guest speaker..." />
            </div>
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? <Loader className="animate-spin" /> : 'Generate'}
            </Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Generated Content</CardTitle>
          {generatedContent && (
            <Button variant="ghost" size="icon" onClick={handleCopy}>
              <Copy className="h-4 w-4" />
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {error && <div className="text-red-500">{error}</div>}
          <div className="prose prose-invert max-w-none h-full p-4 bg-muted rounded-lg overflow-y-auto">
            {generatedContent}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WritingAssistant;
