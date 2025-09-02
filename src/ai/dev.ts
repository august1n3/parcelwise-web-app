import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-anomalies.ts';
import '@/ai/flows/upload-and-summarize-data.ts';
import '@/ai/flows/predict-delivery-time.ts';
