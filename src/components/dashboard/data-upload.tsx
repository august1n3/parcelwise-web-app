'use client';

import { useRef } from 'react';
import { useAction } from '@genkit-ai/next/useAction';
import { uploadAndSummarizeData } from '@/ai/flows/upload-and-summarize-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Upload, Loader2 } from 'lucide-react';
import type { UploadAndSummarizeDataOutput } from '@/ai/flows/upload-and-summarize-data';

type DataUploadProps = {
  onDataProcessed: (data: UploadAndSummarizeDataOutput, fileContent: string) => void;
  setIsLoading: (isLoading: boolean) => void;
  isLoading: boolean;
};

export default function DataUpload({ onDataProcessed, setIsLoading, isLoading }: DataUploadProps) {
  const {run: runAction} = useAction(uploadAndSummarizeData);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'text/csv') {
      toast({
        variant: 'destructive',
        title: 'Invalid File Type',
        description: 'Please upload a CSV file.',
      });
      return;
    }

    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const csvData = e.target?.result as string;
      try {
        const result = await runAction({ csvData });
        onDataProcessed(result, csvData);
      } catch (error) {
        console.error('Error processing data:', error);
        toast({
          variant: 'destructive',
          title: 'Analysis Failed',
          description: 'There was an error analyzing your data. Please try again.',
        });
      } finally {
        setIsLoading(false);
        // Reset file input
        if(fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };
    reader.readAsText(file);
  };
  
  const handleButtonClick = () => {
    fileInputRef.current?.click();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Analyze Delivery Data</CardTitle>
        <CardDescription>Upload a CSV file to get an AI-powered summary and anomaly detection.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2">
          <Label htmlFor="delivery-data-file" className="sr-only">Upload CSV</Label>
          <Input id="delivery-data-file" type="file" accept=".csv" onChange={handleFileChange} ref={fileInputRef} className="hidden" disabled={isLoading} />
          <Button onClick={handleButtonClick} disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload and Analyze
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
