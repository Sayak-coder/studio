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

export const CategoryHelpInput = z.object({
  category: z.string().describe('The category to get help with.'),
});

export const CategoryHelpOutput = z.object({
  description: z.string().describe('A helpful description of the category.'),
  relatedTopics: z.array(z.string()).describe('A list of related topics.'),
});

const prompt = ai.definePrompt({
  name: 'categoryHelpPrompt',
  input: { schema: CategoryHelpInput },
  output: { schema: CategoryHelpOutput },
  prompt: `
    You are an expert academic assistant. The user wants to learn about a topic.
    Provide a concise, helpful description of the topic: "{{category}}".
    Also, provide a short list of 3-5 related topics they might find interesting.
    Keep the descriptions clear and easy for a university student to understand.
  `,
});

export const categoryHelpFlow = ai.defineFlow(
  {
    name: 'categoryHelpFlow',
    inputSchema: CategoryHelpInput,
    outputSchema: CategoryHelpOutput,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  },
);
