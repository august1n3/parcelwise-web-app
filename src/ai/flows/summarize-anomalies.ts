// Summarize the anomalies
'use server';
/**
 * @fileOverview Summarizes delivery anomalies for a given time period.
 *
 * - summarizeAnomalies - A function that summarizes delivery anomalies.
 * - SummarizeAnomaliesInput - The input type for the summarizeAnomalies function.
 * - SummarizeAnomaliesOutput - The return type for the summarizeAnomalies function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeAnomaliesInputSchema = z.object({
  anomalies: z
    .string()
    .describe(
      'A list of delivery anomalies detected, with details including delivery ID, expected delivery date, actual delivery date, and reason for anomaly.'
    ),
  timePeriod: z.string().describe('The time period for which anomalies are being summarized.'),
});
export type SummarizeAnomaliesInput = z.infer<typeof SummarizeAnomaliesInputSchema>;

const SummarizeAnomaliesOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the most significant delivery anomalies for the specified time period.'),
});
export type SummarizeAnomaliesOutput = z.infer<typeof SummarizeAnomaliesOutputSchema>;

export async function summarizeAnomalies(input: SummarizeAnomaliesInput): Promise<SummarizeAnomaliesOutput> {
  return summarizeAnomaliesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeAnomaliesPrompt',
  input: {schema: SummarizeAnomaliesInputSchema},
  output: {schema: SummarizeAnomaliesOutputSchema},
  prompt: `You are an AI logistics expert tasked with summarizing delivery anomalies.

  Given the following list of anomalies for the time period of {{timePeriod}}:
  {{anomalies}}

  Provide a concise summary of the most significant anomalies, highlighting key issues and potential impacts on delivery operations. Focus on the most frequent and impactful anomalies.
  `,
});

const summarizeAnomaliesFlow = ai.defineFlow(
  {
    name: 'summarizeAnomaliesFlow',
    inputSchema: SummarizeAnomaliesInputSchema,
    outputSchema: SummarizeAnomaliesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
