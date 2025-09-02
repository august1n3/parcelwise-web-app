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
import { useToast } from '@/hooks/use-toast';
import { parse as parseCsv } from 'csv-parse/sync';


export default function Dashboard() {
  const [summaryData, setSummaryData] = useState<UploadAndSummarizeDataOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [deliveries, setDeliveries] = useState<Delivery[]>(MOCK_DELIVERIES);
  const { toast } = useToast();

  const handleDataProcessed = async (data: UploadAndSummarizeDataOutput, fileContent: string) => {
    setSummaryData(data);
    
    try {
      const records = parseCsv(fileContent, {
        columns: true,
        skip_empty_lines: true,
      });

      const predictionInput = records.map((record: any) => ({
        receipt_lng: parseFloat(record.receipt_lng),
        receipt_lat: parseFloat(record.receipt_lat),
        sign_lng: parseFloat(record.sign_lng),
        sign_lat: parseFloat(record.sign_lat),
        hour: parseInt(record.hour, 10),
        day_of_week: parseInt(record.day_of_week, 10),
        distance_km: parseFloat(record.distance_km),
        city_encoded: parseInt(record.city_encoded, 10),
        typecode_encoded: parseInt(record.typecode_encoded, 10),
      }));

      const predictionResult = await predictDeliveryTime(predictionInput);
      
      const newDeliveries = records.map((record: any, index: number): Delivery => ({
        id: record.order_id || `ORD${index + 1}`,
        customerName: record.customer_name || 'N/A',
        destination: record.destination || 'N/A',
        status: record.status || 'Pending',
        predictedDelivery: record.predicted_delivery || '',
        deliveryDate: record.delivery_date || '',
        predictedTravelTime: Math.round(predictionResult.predicted_travel_times[index]),
      }));
      
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
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
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
