'use server';
/**
 * @fileOverview Summarizes uploaded CSV data and identifies potential anomalies using simple analysis.
 *
 * - uploadAndSummarizeData - A function that handles the data summarization process.
 * - UploadAndSummarizeDataInput - The input type for the uploadAndSummarizeData function.
 * - UploadAndSummarizeDataOutput - The return type for the uploadAndSummarizeData function.
 */

import { parse as parseCsv } from 'csv-parse/sync';

export interface UploadAndSummarizeDataInput {
  csvData: string;
  predictedTravelTimes: number[];
}

export interface UploadAndSummarizeDataOutput {
  summary: string;
  anomalies: string;
  count: number;
  list: number[];
}

// Helper function to calculate basic statistics
function calculateStats(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b);
  const sum = values.reduce((a, b) => a + b, 0);
  const mean = sum / values.length;
  const median = sorted[Math.floor(sorted.length / 2)];
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  
  // Calculate standard deviation
  const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);
  
  return { mean, median, min, max, stdDev, count: values.length };
}

// Helper function to detect anomalies using IQR method
function detectAnomalies(deliveries: number[], errors: number[], threshold: number = 0.5) {
  const sorted = [...errors].sort((a, b) => a - b);
  const q1Index = Math.floor(sorted.length * 0.25);
  const q3Index = Math.floor(sorted.length * 0.75);
  const q1 = sorted[q1Index];
  const q3 = sorted[q3Index];
  const iqr = q3 - q1;

  const lowerBound = q1 - threshold * iqr;
  const upperBound = q3 + threshold * iqr;
  console.log('Anomaly Detection Bounds:', { lowerBound, upperBound });
  return deliveries.map((value, index) => ({
    index,
    value,
    isAnomaly: errors[index] < lowerBound || errors[index] > upperBound,
    type: errors[index] < lowerBound ? 'low' : errors[index] > upperBound ? 'high' : 'normal'
  }));
}

export async function uploadAndSummarizeData(input: UploadAndSummarizeDataInput): Promise<UploadAndSummarizeDataOutput> {
  try {
    // Parse CSV data
    const records = parseCsv(input.csvData, {
      columns: true,
      skip_empty_lines: true,
    });
    
    if (records.length === 0) {
      return {
        summary: 'No data found in the uploaded file.',
        anomalies: 'No anomalies detected due to lack of data.',
        count: 0,
        list: []
      };
    }
    
    // Calculate delivery times if we have both receipt_time and sign_time
    const deliveryTimes: number[] = [];
    const distances: number[] = [];
    const cities = new Set<string>();
    

    for (const record of records) {
      const csvRecord = record as Record<string, any>;
      // Calculate delivery time in minutes
      if (csvRecord.receipt_time && csvRecord.sign_time) {
        const receiptTime = new Date(csvRecord.receipt_time);
        const signTime = new Date(csvRecord.sign_time);
        const deliveryTimeMinutes = (signTime.getTime() - receiptTime.getTime()) / (1000 * 60);
        if (deliveryTimeMinutes > 0) {
          deliveryTimes.push(deliveryTimeMinutes);
        }
      }
      
      // Collect other metrics
      if (csvRecord.from_city_name) cities.add(csvRecord.from_city_name);
    }
    
    // Generate summary
    const deliveryStats = deliveryTimes.length > 0 ? calculateStats(deliveryTimes) : null;
    const totalOrders = records.length;
    const uniqueCities = cities.size;
    
    
    let summary = `Dataset Summary:\n`;
    summary += `• Total Orders: ${totalOrders}\n`;
    summary += `• Unique Cities: ${uniqueCities}\n`;
    
    if (deliveryStats) {
      summary += `\nDelivery Time Analysis:\n`;
      summary += `• Average Delivery Time: ${deliveryStats.mean.toFixed(1)} minutes\n`;
      summary += `• Median Delivery Time: ${deliveryStats.median.toFixed(1)} minutes\n`;
      summary += `• Fastest Delivery: ${deliveryStats.min.toFixed(1)} minutes\n`;
      summary += `• Slowest Delivery: ${deliveryStats.max.toFixed(1)} minutes\n`;
      summary += `• Standard Deviation: ${deliveryStats.stdDev.toFixed(1)} minutes`;
    }
    
    // Detect anomalies
    let anomaliesText = 'No anomalies detected.';
    let anomalyCount = 0;
    let anomalyList: number[] = [];
    
    if (deliveryTimes.length > 0 && input.predictedTravelTimes && input.predictedTravelTimes.length > 0) {
      // Ensure we don't go beyond the available predicted times
      const maxLength = Math.min(deliveryTimes.length, input.predictedTravelTimes.length);
      
      const errors: number[] = deliveryTimes.slice(0, maxLength).map((time, index) => {
        const predicted = input.predictedTravelTimes[index];
        return predicted ?  time -  predicted : 0;
      });

      if (errors.length > 0 && errors.some(e => e > 0)) {
        const anomalies = detectAnomalies(deliveryTimes.slice(0, maxLength), errors);
        anomalyCount = anomalies.filter(a => a.isAnomaly).length;
        
        const highAnomalies = anomalies.filter(a => a.type === 'high');
        const lowAnomalies = anomalies.filter(a => a.type === 'low');
        
        highAnomalies.forEach(a => anomalyList.push(a.index));
        console.log('Anomaly List:', anomalyList);
        lowAnomalies.forEach(a => anomalyList.push(a.index));
        console.log('Anomaly List:', anomalyList);
        if (anomalyCount > 0) {
          anomaliesText = `Detected ${anomalyCount} anomalies in delivery times:\n`;
          if (highAnomalies.length > 0) {
            anomaliesText += `• ${highAnomalies.length} unusually long delivery times (avg: ${(highAnomalies.reduce((sum, a) => sum + a.value, 0) / highAnomalies.length).toFixed(1)} minutes)\n`;
          }
          if (lowAnomalies.length > 0) {
            anomaliesText += `• ${lowAnomalies.length} unusually short delivery times (avg: ${(lowAnomalies.reduce((sum, a) => sum + a.value, 0) / lowAnomalies.length).toFixed(1)} minutes)`;
          }
        }
      }
    } else if (deliveryTimes.length > 0) {
      // If we have delivery times but no predictions, we can still do basic statistical anomaly detection
      const stats = calculateStats(deliveryTimes);
      const threshold = 2; // 2 standard deviations
      const lowerBound = stats.mean - threshold * stats.stdDev;
      const upperBound = stats.mean + threshold * stats.stdDev;
      
      deliveryTimes.forEach((time, index) => {
        if (time < lowerBound || time > upperBound) {
          anomalyList.push(index);
          anomalyCount++;
        }
      });
      
      if (anomalyCount > 0) {
        anomaliesText = `Detected ${anomalyCount} statistical anomalies in delivery times (based on ${threshold} standard deviations from mean).`;
      }
    }
    
    return {
      summary,
      anomalies: anomaliesText,
      count: anomalyCount,
      list: anomalyList
    };
    
  } catch (error) {
    console.error('Error analyzing CSV data:', error);
    return {
      summary: 'Error analyzing the uploaded data. Please check the CSV format.',
      anomalies: 'Unable to detect anomalies due to data processing error.',
      count: 0,
      list: []
    };
  }
}
