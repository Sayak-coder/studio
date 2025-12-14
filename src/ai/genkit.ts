import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GEMINI_API_KEY,
      // By defining the model here, we ensure Genkit uses the correct
      // and stable version provided by the googleAI plugin.
      model: 'gemini-1.5-flash',
    }),
  ],
  // Removing the global model property resolves the lookup conflict.
});
