/**
 * @fileoverview A flow that generates a detailed, structured prompt for an external LLM like ChatGPT.
 */
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GeneratePromptInputSchema = z.object({
  category: z.string(),
});
export type GeneratePromptInput = z.infer<typeof GeneratePromptInputSchema>;

const GeneratePromptOutputSchema = z.object({
  prompt: z.string().describe('The generated, detailed prompt for the user to copy.'),
});
export type GeneratePromptOutput = z.infer<typeof GeneratePromptOutputSchema>;

/**
 * Generates a detailed prompt for a given academic topic.
 * @param input The category to generate a prompt for.
 * @returns A promise that resolves to the generated prompt.
 */
export async function generateChatGptPrompt(input: GeneratePromptInput): Promise<GeneratePromptOutput> {
  return generatePromptFlow(input);
}

const generatePromptFlow = ai.defineFlow(
  {
    name: 'generatePromptFlow',
    inputSchema: GeneratePromptInputSchema,
    outputSchema: GeneratePromptOutputSchema,
  },
  async ({ category }) => {
    const prompt = `
You are an expert academic assistant. Your task is to provide relevant and up-to-date information about any academic topic.

The topic is: "${category}".

Please provide a response in the following format:

### Description
Provide a concise, helpful description of this topic.

### Related Topics
Provide a short list of 3-5 related academic topics that would be interesting.
    `;
    return { prompt: prompt.trim() };
  }
);
