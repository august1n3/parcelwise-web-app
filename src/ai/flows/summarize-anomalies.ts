'use server';
/**
 * @fileOverview Summarizes delivery anomalies for a given time period using simple analysis.
 *
 * - summarizeAnomalies - A function that summarizes delivery anomalies.
 * - SummarizeAnomaliesInput - The input type for the summarizeAnomalies function.
 * - SummarizeAnomaliesOutput - The return type for the summarizeAnomalies function.
 */

export interface SummarizeAnomaliesInput {
  anomalies: string;
  timePeriod: string;
}

export interface SummarizeAnomaliesOutput {
  summary: string;
}

export async function summarizeAnomalies(input: SummarizeAnomaliesInput): Promise<SummarizeAnomaliesOutput> {
  try {
    // Parse anomalies text to extract key information
    const anomaliesText = input.anomalies;
    const timePeriod = input.timePeriod;
    
    // Simple text analysis to create a summary
    let summary = `Anomaly Summary for ${timePeriod}:\n\n`;
    
    if (anomaliesText === 'No anomalies detected.' || !anomaliesText.trim()) {
      summary += 'No significant delivery anomalies were detected during this period. All deliveries appear to be operating within normal parameters.';
    } else {
      // Extract key metrics from anomalies text
      const lines = anomaliesText.split('\n').filter(line => line.trim());
      
      summary += 'Key Findings:\n';
      
      for (const line of lines) {
        if (line.includes('Detected')) {
          // Extract anomaly count
          const countMatch = line.match(/(\d+)\s+anomalies/);
          if (countMatch) {
            const count = parseInt(countMatch[1]);
            summary += `• Total anomalies identified: ${count}\n`;
            
            if (count > 10) {
              summary += `• High anomaly rate detected - requires immediate attention\n`;
            } else if (count > 5) {
              summary += `• Moderate anomaly rate - monitor closely\n`;
            } else {
              summary += `• Low anomaly rate - within acceptable range\n`;
            }
          }
        } else if (line.includes('unusually long')) {
          summary += `• ${line.trim()}\n`;
        } else if (line.includes('unusually short')) {
          summary += `• ${line.trim()}\n`;
        }
      }
      
      summary += '\nRecommendations:\n';
      if (anomaliesText.includes('unusually long')) {
        summary += '• Investigate routes with extended delivery times\n';
        summary += '• Review driver assignments and traffic patterns\n';
      }
      if (anomaliesText.includes('unusually short')) {
        summary += '• Verify accuracy of unusually fast deliveries\n';
        summary += '• Check for potential data entry errors\n';
      }
      summary += '• Continue monitoring delivery performance trends';
    }
    
    return { summary };
    
  } catch (error) {
    console.error('Error summarizing anomalies:', error);
    return {
      summary: `Error summarizing anomalies for ${input.timePeriod}. Please check the input data format.`
    };
  }
}
