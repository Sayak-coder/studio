import { config } from 'dotenv';
config();

import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: "AIzaSyB35C6uDszDPs6QlX1Lh9SwYAVTV7F2sfk",
    }),
  ],
});
