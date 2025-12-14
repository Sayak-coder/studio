import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: 'AIzaSyDR9MFmvZEBx01-xcG4VfcHX2KBdQrGEVQ',
    }),
  ],
  model: 'googleai/gemini-pro',
});
