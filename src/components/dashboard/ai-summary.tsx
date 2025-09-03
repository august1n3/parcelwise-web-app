import { summarizeAnomalies } from '@/ai/flows/summarize-anomalies';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Bot } from 'lucide-react';
import { useEffect, useState } from 'react';

type AiSummaryProps = {
  isLoading: boolean;
  summary?: string;
  anomalies?: string;
};

async function runAction(anomalies: string | undefined) {
  const anomaliesSummary = await summarizeAnomalies({ anomalies: anomalies || '', timePeriod: new Date().toTimeString() });
  return anomaliesSummary;
}

export default function AiSummary({ isLoading, summary, anomalies }: AiSummaryProps) {

  const [anomaliesSummary, setAnomaliesSummary] = useState<string | undefined>(undefined);

  const handleSummary = async () => {
    // Only run if anomalies data is present and we haven't already generated a summary
    if (anomalies && !anomaliesSummary) {
      const response = await runAction(anomalies);
      setAnomaliesSummary(response.summary);
      console.log('Anomalies Summary:', response.summary);
    }
  };

  // Use useEffect to call handleSummary after the component mounts and when `anomalies` data changes.
  useEffect(() => {
    handleSummary();
  }, [anomalies]);

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Bot className="h-5 w-5" /> AI Analysis</CardTitle>
          <CardDescription>Generating insights from your data...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Skeleton className="h-4 w-1/4 mb-2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full mt-1" />
            <Skeleton className="h-4 w-3/4 mt-1" />
          </div>
          <div>
            <Skeleton className="h-4 w-1/3 mb-2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full mt-1" />
            <Skeleton className="h-4 w-2/3 mt-1" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!summary && !anomalies) {
    return null;
  }
  
  return (
    <Card onLoad={handleSummary}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Bot className="h-5 w-5 text-primary" /> AI Analysis</CardTitle>
        <CardDescription>Insights generated from your delivery data.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        {summary && (
          <div>
            <h3 className="font-semibold mb-2 text-foreground">Data Summary</h3>
            <p className="text-muted-foreground whitespace-pre-wrap">{summary}</p>
          </div>
        )}
        {anomalies && (
          <div>
            <h3 className="font-semibold mb-2 text-foreground">Detected Anomalies</h3>
            <p className="text-muted-foreground whitespace-pre-wrap">{anomaliesSummary || anomalies }</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
