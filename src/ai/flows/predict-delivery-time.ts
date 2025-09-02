'use server';
/**
 * @fileOverview A flow for predicting delivery travel time using an external model.
 * - predictDeliveryTime - A function that calls the external prediction model.
 */

import { 
  type DeliveryPredictionInput, 
  type PredictionResponse,
  transformCsvToModelInput 
} from '@/lib/delivery-utils';


// Updated function that can handle both direct prediction input and CSV records
export async function predictDeliveryTime(
  input: DeliveryPredictionInput[] | { data: DeliveryPredictionInput[] } | Record<string, any>[]
): Promise<PredictionResponse> {
  let predictionData: DeliveryPredictionInput[];
  
  // Handle different input formats
  if (Array.isArray(input)) {
    // If input is an array, check if it's CSV records or prediction input
    if (input.length > 0 && 'order_id' in input[0]) {
      // This looks like CSV records, transform them
      predictionData = input.map(record => transformCsvToModelInput(record));
    } else {
      // This looks like already formatted prediction input
      predictionData = input as DeliveryPredictionInput[];
    }
  } else if ('data' in input) {
    // Handle the legacy format with { data: [...] }
    predictionData = input.data;
  } else {
    throw new Error('Invalid input format for predictDeliveryTime');
  }
  
  console.log('Transformed prediction data:', JSON.stringify(predictionData, null, 2));
  
  const response = await fetch('http://34.35.16.97:8080/predict', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(predictionData),
  });
  
  console.log('Request payload:', JSON.stringify(predictionData));
  console.log('Response status:', response.status);
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to fetch prediction: ${response.statusText} - ${errorText}`
    );
  }

  const result: PredictionResponse = await response.json();
  return result;
}
