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
}

export interface UploadAndSummarizeDataOutput {
  summary: string;
  anomalies: string;
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
function detectAnomalies(values: number[], threshold: number = 1.5) {
  const sorted = [...values].sort((a, b) => a - b);
  const q1Index = Math.floor(sorted.length * 0.25);
  const q3Index = Math.floor(sorted.length * 0.75);
  const q1 = sorted[q1Index];
  const q3 = sorted[q3Index];
  const iqr = q3 - q1;
  
  const lowerBound = q1 - threshold * iqr;
  const upperBound = q3 + threshold * iqr;
  
  return values.map((value, index) => ({
    index,
    value,
    isAnomaly: value < lowerBound || value > upperBound,
    type: value < lowerBound ? 'low' : value > upperBound ? 'high' : 'normal'
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
        anomalies: 'No anomalies detected due to lack of data.'
      };
    }
    
    // Calculate delivery times if we have both receipt_time and sign_time
    const deliveryTimes: number[] = [];
    const distances: number[] = [];
    const cities = new Set<string>();
    const typeCodes = new Set<string>();
    
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
      if (csvRecord.typecode) typeCodes.add(csvRecord.typecode);
    }
    
    // Generate summary
    const deliveryStats = deliveryTimes.length > 0 ? calculateStats(deliveryTimes) : null;
    const totalOrders = records.length;
    const uniqueCities = cities.size;
    const uniqueTypesCodes = typeCodes.size;
    
    let summary = `Dataset Summary:\n`;
    summary += `• Total Orders: ${totalOrders}\n`;
    summary += `• Unique Cities: ${uniqueCities}\n`;
    summary += `• Unique Type Codes: ${uniqueTypesCodes}\n`;
    
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
    if (deliveryTimes.length > 0) {
      const anomalies = detectAnomalies(deliveryTimes);
      const anomalyCount = anomalies.filter(a => a.isAnomaly).length;
      const highAnomalies = anomalies.filter(a => a.type === 'high');
      const lowAnomalies = anomalies.filter(a => a.type === 'low');
      
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
    
    return {
      summary,
      anomalies: anomaliesText
    };
    
  } catch (error) {
    console.error('Error analyzing CSV data:', error);
    return {
      summary: 'Error analyzing the uploaded data. Please check the CSV format.',
      anomalies: 'Unable to detect anomalies due to data processing error.'
    };
  }
}
