/**
 * @fileoverview A flow that provides helpful information about a category.
 *
 * This file defines a Genkit flow that takes a category name as input and
 * returns a helpful description and a list of related topics. This is used
 * in the "AI-Powered Study Helper" on the student dashboard.
 *
 * - categoryHelpFlow - The main flow function.
 * - CategoryHelpInput - The Zod schema for the flow's input.
 * - CategoryHelpOutput - The Zod schema for the flow's output.
 */
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const CategoryHelpInputSchema = z.object({
  category: z.string().describe('The category to get help with.'),
});
export type CategoryHelpInput = z.infer<typeof CategoryHelpInputSchema>;


const CategoryHelpOutputSchema = z.object({
  description: z.string().describe('A helpful description of the category.'),
  relatedTopics: z.array(z.string()).describe('A list of related topics.'),
});
export type CategoryHelpOutput = z.infer<typeof CategoryHelpOutputSchema>;


const prompt = ai.definePrompt({
  name: 'categoryHelpPrompt',
  input: { schema: CategoryHelpInputSchema },
  output: { schema: CategoryHelpOutputSchema },
  prompt: `
    You are an expert academic assistant. The user wants to learn about a topic.
    Provide a concise, helpful description of the topic: "{{category}}".
    Also, provide a short list of 3-5 related topics they might find interesting.
    Keep the descriptions clear and easy for a university student to understand.
  `,
});

const categoryHelp = ai.defineFlow(
  {
    name: 'categoryHelpFlow',
    inputSchema: CategoryHelpInputSchema,
    outputSchema: CategoryHelpOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  },
);

export async function categoryHelpFlow(input: CategoryHelpInput): Promise<CategoryHelpOutput> {
    return categoryHelp(input);
}
