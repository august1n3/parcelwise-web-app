'use client';

import { useState } from 'react';
import type { UploadAndSummarizeDataOutput } from '@/ai/flows/upload-and-summarize-data';
import type { Delivery } from '@/lib/types';
import { MOCK_DELIVERIES } from '@/lib/data';
import KpiCards from '@/components/dashboard/kpi-cards';
import DataUpload from '@/components/dashboard/data-upload';
import AiSummary from '@/components/dashboard/ai-summary';
import DeliveryData from '@/components/dashboard/delivery-data';
import { predictDeliveryTime } from '@/ai/flows/predict-delivery-time';
import { uploadAndSummarizeData } from '@/ai/flows/upload-and-summarize-data';
import { useToast } from '@/hooks/use-toast';
import { parse as parseCsv } from 'csv-parse/sync';


export default function Dashboard() {
  const [summaryData, setSummaryData] = useState<UploadAndSummarizeDataOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [deliveries, setDeliveries] = useState<Delivery[]>(MOCK_DELIVERIES);
  const { toast } = useToast();

  const handleDataProcessed = async (fileContent: string) => {
    try {
      // First, parse the CSV data
      const records = parseCsv(fileContent, {
        columns: true,
        skip_empty_lines: true,
      });

      if (records.length === 0) {
        toast({
          variant: 'destructive',
          title: 'Empty File',
          description: 'The uploaded CSV file contains no data.',
        });
        return;
      }

      // Second, get predictions for the parsed data
      const predictionResult = await predictDeliveryTime(records as Record<string, any>[]);
      
      // Third, run the summary analysis with the correct predicted travel times
      const analysisResult = await uploadAndSummarizeData({
        csvData: fileContent,
        predictedTravelTimes: predictionResult.predicted_travel_times
      });
      
      // Fourth, create delivery objects with all correct data
      const newDeliveries = records.map((record: any, index: number): Delivery => {
        const isAnomaly = analysisResult.list.includes(index);
        return {
          id: record.order_id || `ORD${index + 1}`,
          customerName: record.delivery_user_id || 'N/A',
          destination: `${record.from_city_name || 'Unknown'} to Delivery Point`,
          status: isAnomaly ? 'Anomaly' : (Math.abs(new Date(record.receipt_time).getTime() - new Date(record.sign_time).getTime()) / 60000) > predictionResult.predicted_travel_times[index] ? 'Delayed' : 'On Time',
          actualTravelTime: Math.abs(new Date(record.receipt_time).getTime() - new Date(record.sign_time).getTime()) / 60000,
          deliveryDate: record.delivery_date || record.sign_time || '',
          predictedTravelTime: Math.round(predictionResult.predicted_travel_times[index]),
        };
      });
      
      // Finally, update state with all processed data
      setSummaryData(analysisResult);
      setDeliveries(newDeliveries);

    } catch(e) {
      console.error('Error processing or predicting from CSV:', e);
      toast({
        variant: 'destructive',
        title: 'CSV Processing Failed',
        description: 'Could not parse the CSV file or get predictions. Please check the file format and try again.',
      });
    }
  };

  const anomalyCount = deliveries.filter(d => d.status === 'Anomaly').length;
  const onTimeCount = deliveries.filter(d => d.status === 'On Time').length;
  const totalDeliveries = deliveries.length;


  return (
    <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
      <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3">
          <KpiCards 
            totalDeliveries={totalDeliveries}
            onTimeCount={onTimeCount}
            anomalyCount={anomalyCount}
          />
        </div>
        <DeliveryData deliveries={deliveries} />
      </div>
      <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-1">
        <DataUpload onDataProcessed={handleDataProcessed} setIsLoading={setIsLoading} isLoading={isLoading} />
        {isLoading || summaryData ? (
          <AiSummary 
            isLoading={isLoading} 
            summary={summaryData?.summary} 
            anomalies={summaryData?.anomalies} 
          />
        ) : null}
      </div>
    </div>
  );
}
