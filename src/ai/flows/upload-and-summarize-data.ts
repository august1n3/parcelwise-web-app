'use server';
/**
 * @fileOverview Summarizes uploaded CSV data and identifies potential anomalies.
 *
 * - uploadAndSummarizeData - A function that handles the data summarization process.
 * - UploadAndSummarizeDataInput - The input type for the uploadAndSummarizeData function.
 * - UploadAndSummarizeDataOutput - The return type for the uploadAndSummarizeData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const UploadAndSummarizeDataInputSchema = z.object({
  csvData: z
    .string()
    .describe("The CSV data to analyze."),
});
export type UploadAndSummarizeDataInput = z.infer<typeof UploadAndSummarizeDataInputSchema>;

const UploadAndSummarizeDataOutputSchema = z.object({
  summary: z.string().describe('A summary of key metrics from the dataset.'),
  anomalies: z.string().describe('Identified anomalies in the delivery patterns.'),
});
export type UploadAndSummarizeDataOutput = z.infer<typeof UploadAndSummarizeDataOutputSchema>;

export async function uploadAndSummarizeData(input: UploadAndSummarizeDataInput): Promise<UploadAndSummarizeDataOutput> {
  return uploadAndSummarizeDataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'uploadAndSummarizeDataPrompt',
  input: {schema: UploadAndSummarizeDataInputSchema},
  output: {schema: UploadAndSummarizeDataOutputSchema},
  prompt: `You are an expert data analyst specializing in delivery operations.

You will analyze the provided CSV data and provide a summary of key metrics, such as average delivery time, on-time delivery rate, and any other relevant information.

Also, identify potential anomalies in the delivery patterns, such as unusually long or short delivery times, and highlight them.

CSV Data: {{{csvData}}}`,
});

const uploadAndSummarizeDataFlow = ai.defineFlow(
  {
    name: 'uploadAndSummarizeDataFlow',
    inputSchema: UploadAndSummarizeDataInputSchema,
    outputSchema: UploadAndSummarizeDataOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
