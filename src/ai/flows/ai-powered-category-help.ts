/**
 * @fileoverview A flow that provides helpful information about a category by calling the Gemini API directly.
 */
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { googleAI } from '@genkit-ai/google-genai';

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
  model: googleAI.model('gemini-pro'),
  input: { schema: CategoryHelpInputSchema },
  output: { schema: CategoryHelpOutputSchema },
  prompt: `
    You are an expert academic assistant. The user wants to learn about a topic.
    Provide a concise, helpful description of the topic: "{{category}}".
    Also, provide a short list of 3-5 related topics they might find interesting.
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
