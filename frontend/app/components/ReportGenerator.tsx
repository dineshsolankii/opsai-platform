'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader, Copy } from 'lucide-react';

const ReportGenerator = () => {
  const [reportType, setReportType] = useState('Weekly Progress');
  const [data, setData] = useState('');
  const [timePeriod, setTimePeriod] = useState('');
  const [generatedReport, setGeneratedReport] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [taskId, setTaskId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setGeneratedReport('');
    setTaskId(null);

    const token = localStorage.getItem('token');
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/report-generator`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ report_type: reportType, data, time_period: timePeriod }),
    });

    if (response.ok) {
      const resData = await response.json();
      setTaskId(resData.task_id);
    } else {
      setError('Failed to start report generation');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (taskId) {
      const interval = setInterval(async () => {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tasks/${taskId}`);
        const resData = await res.json();
        if (resData.status === 'SUCCESS') {
          setGeneratedReport(resData.result);
          setIsLoading(false);
          clearInterval(interval);
        } else if (resData.status === 'FAILURE') {
          setError('Report generation failed');
          setIsLoading(false);
          clearInterval(interval);
        }
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [taskId]);

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedReport);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Report Generator</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label>Report Type</Label>
              <Select onValueChange={setReportType} defaultValue={reportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Weekly Progress">Weekly Progress</SelectItem>
                  <SelectItem value="Event Summary">Event Summary</SelectItem>
                  <SelectItem value="Budget Overview">Budget Overview</SelectItem>
                  <SelectItem value="Activity Report">Activity Report</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="data">Data/Notes</Label>
              <Textarea id="data" value={data} onChange={(e) => setData(e.target.value)} placeholder="Paste your data, notes, or key points here..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time-period">Time Period</Label>
              <Input id="time-period" value={timePeriod} onChange={(e) => setTimePeriod(e.target.value)} placeholder="e.g., Last 7 Days, Q3 2024" />
            </div>
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? <Loader className="animate-spin" /> : 'Generate Report'}
            </Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Formatted Report</CardTitle>
          {generatedReport && (
            <Button variant="ghost" size="icon" onClick={handleCopy}>
              <Copy className="h-4 w-4" />
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {error && <div className="text-red-500">{error}</div>}
          <div className="prose prose-invert max-w-none h-full p-4 bg-muted rounded-lg overflow-y-auto">
            <pre className="whitespace-pre-wrap">{generatedReport}</pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportGenerator;
