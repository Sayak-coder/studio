/**
 * @fileoverview A flow that generates a structured, helpful response for an academic topic.
 */
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GetTopicHelpInputSchema = z.object({
  topic: z.string().describe('The academic topic the user wants help with.'),
});
export type GetTopicHelpInput = z.infer<typeof GetTopicHelpInputSchema>;

const GetTopicHelpOutputSchema = z.object({
  description: z.string().describe('A concise, helpful description of the topic.'),
  relatedTopics: z.array(z.string()).describe('A short list of 3-5 related academic topics.'),
});
export type GetTopicHelpOutput = z.infer<typeof GetTopicHelpOutputSchema>;

/**
 * Generates a structured help response for a given academic topic.
 * @param input The topic to get help for.
 * @returns A promise that resolves to the structured help response.
 */
export async function getTopicHelp(input: GetTopicHelpInput): Promise<GetTopicHelpOutput> {
  return getTopicHelpFlow(input);
}


const getTopicHelpFlow = ai.defineFlow(
  {
    name: 'getTopicHelpFlow',
    inputSchema: GetTopicHelpInputSchema,
    outputSchema: GetTopicHelpOutputSchema,
  },
  async ({ topic }) => {
    
    const llmResponse = await ai.generate({
      prompt: `
        You are an expert academic assistant. Your task is to provide relevant and up-to-date information about any academic topic.

        The user's topic is: "${topic}".

        Please provide a concise, helpful description of this topic and a short list of 3-5 related academic topics.
      `,
      model: 'googleai/gemini-2.5-flash',
      output: {
        schema: GetTopicHelpOutputSchema,
      },
      config: {
        temperature: 0.5,
      }
    });

    return llmResponse.output!;
  }
);
