/**
 * @fileoverview A flow that provides helpful information about a category by calling the Gemini API directly.
 */
'use server';

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { z } from 'zod';

const CategoryHelpInputSchema = z.object({
  category: z.string(),
});
export type CategoryHelpInput = z.infer<typeof CategoryHelpInputSchema>;

const CategoryHelpOutputSchema = z.object({
  description: z
    .string()
    .describe('A concise, helpful description of the topic.'),
  relatedTopics: z
    .array(z.string())
    .describe('A short list of 3-5 related topics the user might find interesting.'),
});
export type CategoryHelpOutput = z.infer<typeof CategoryHelpOutputSchema>;


const categoryHelpPrompt = ai.definePrompt({
  name: 'categoryHelpPrompt',
  input: { schema: CategoryHelpInputSchema },
  output: { schema: CategoryHelpOutputSchema },
  model: googleAI.model('gemini-1.5-pro'),
  prompt: `
    You are an expert academic assistant. Your task is to provide relevant and up-to-date information about any academic topic the user asks about, sourcing your information from the internet for accuracy.
    
    The user wants to learn about the topic: "{{category}}".

    Please provide a concise, helpful description of this topic.
    Also, provide a short list of 3-5 related academic topics they might find interesting.
  `,
});


const categoryHelpGenkitFlow = ai.defineFlow(
  {
    name: 'categoryHelpFlow',
    inputSchema: CategoryHelpInputSchema,
    outputSchema: CategoryHelpOutputSchema,
  },
  async (input) => {
    const { output } = await categoryHelpPrompt(input);
    return output!;
  }
);


/**
 * Calls the Google Gemini API directly to get a description and related topics for a given category.
 * @param input The category to get help with.
 * @returns A promise that resolves to the structured output from the AI.
 */
export async function categoryHelpFlow(input: CategoryHelpInput): Promise<CategoryHelpOutput> {
  return categoryHelpGenkitFlow(input);
}
