import { config } from 'dotenv';
config();

// AI flows are now standalone functions without Genkit dependencies
// Import the functions if needed for development testing
import { summarizeAnomalies } from '@/ai/flows/summarize-anomalies';
import { uploadAndSummarizeData } from '@/ai/flows/upload-and-summarize-data';
import { predictDeliveryTime } from '@/ai/flows/predict-delivery-time';

// You can add development testing code here if needed
console.log('AI flows loaded successfully without Genkit dependencies');
