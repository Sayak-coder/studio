import { config } from 'dotenv';
config();

import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GEMINI_API_KEY,
    }),
  ],
  // A global model definition is required for ai.definePrompt to work correctly.
  model: googleAI.model('gemini-1.5-flash'),
});
