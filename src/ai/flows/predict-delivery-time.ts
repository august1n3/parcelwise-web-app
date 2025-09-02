'use server';
/**
 * @fileOverview A flow for predicting delivery travel time using an external model.
 *
 * - predictDeliveryTime - A function that calls the external prediction model.
 * - DeliveryPredictionInput - The input type for the predictDeliveryTime function.
 * - DeliveryPredictionOutput - The return type for the predictDeliveryTime function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const DeliveryInfoSchema = z.object({
    receipt_lng: z.number(),
    receipt_lat: z.number(),
    sign_lng: z.number(),
    sign_lat: z.number(),
    hour: z.number(),
    day_of_week: z.number(),
    distance_km: z.number(),
    city_encoded: z.number(),
    typecode_encoded: z.number(),
});

const DeliveryPredictionInputSchema = z.array(DeliveryInfoSchema);

export type DeliveryPredictionInput = z.infer<typeof DeliveryPredictionInputSchema>;

const DeliveryPredictionOutputSchema = z.object({
  predicted_travel_times: z.array(z.number()),
});

export type DeliveryPredictionOutput = z.infer<typeof DeliveryPredictionOutputSchema>;

export async function predictDeliveryTime(
  input: DeliveryPredictionInput
): Promise<DeliveryPredictionOutput> {
  return predictDeliveryTimeFlow(input);
}

const predictDeliveryTimeFlow = ai.defineFlow(
  {
    name: 'predictDeliveryTimeFlow',
    inputSchema: DeliveryPredictionInputSchema,
    outputSchema: DeliveryPredictionOutputSchema,
  },
  async payload => {
    const response = await fetch('http://34.35.16.97:8080/predict', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to fetch prediction: ${response.statusText} - ${errorText}`
      );
    }

    const result = await response.json();
    return DeliveryPredictionOutputSchema.parse(result);
  }
);
