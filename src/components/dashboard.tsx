'use client';

import { useState } from 'react';
import type { UploadAndSummarizeDataOutput } from '@/ai/flows/upload-and-summarize-data';
import type { Delivery } from '@/lib/types';
import { MOCK_DELIVERIES } from '@/lib/data';
import KpiCards from '@/components/dashboard/kpi-cards';
import DataUpload from '@/components/dashboard/data-upload';
import AiSummary from '@/components/dashboard/ai-summary';
import DeliveryData from '@/components/dashboard/delivery-data';

export default function Dashboard() {
  const [summaryData, setSummaryData] = useState<UploadAndSummarizeDataOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [deliveries, setDeliveries] = useState<Delivery[]>(MOCK_DELIVERIES);

  const handleDataProcessed = (data: UploadAndSummarizeDataOutput, fileContent: string) => {
    setSummaryData(data);
    // In a real app, you would parse the `fileContent` (CSV) 
    // and update the `deliveries` state to reflect the uploaded data.
    // For this demo, we'll just log it and keep the mock data.
    console.log("CSV content received, ready for parsing:", fileContent.substring(0, 200) + '...');
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