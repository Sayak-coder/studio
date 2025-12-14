'use server';
/**
 * @fileOverview An AI agent that provides category-specific help.
 *
 * - aiPoweredCategoryHelp - A function that handles the category-specific help process.
 * - AiPoweredCategoryHelpInput - The input type for the aiPoweredCategoryHelp function.
 * - AiPoweredCategoryHelpOutput - The return type for the aiPoweredCategoryHelp function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiPoweredCategoryHelpInputSchema = z.object({
  category: z.enum(['Student', 'Class Representative', 'Senior']).describe('The category for which help is requested.'),
  query: z.string().describe('The user query for help within the specified category.'),
});
export type AiPoweredCategoryHelpInput = z.infer<typeof AiPoweredCategoryHelpInputSchema>;

const AiPoweredCategoryHelpOutputSchema = z.object({
  response: z.string().describe('The AI-generated response to the user query.'),
});
export type AiPoweredCategoryHelpOutput = z.infer<typeof AiPoweredCategoryHelpOutputSchema>;

export async function aiPoweredCategoryHelp(input: AiPoweredCategoryHelpInput): Promise<AiPoweredCategoryHelpOutput> {
  return aiPoweredCategoryHelpFlow(input);
}

const studentHelpTool = ai.defineTool({
  name: 'getStudentHelp',
  description: 'Provides information and assistance specific to students.',
  inputSchema: z.object({
    query: z.string().describe('The specific question or topic the student needs help with.'),
  }),
  outputSchema: z.string(),
}, async (input) => {
  // Placeholder implementation for student help
  return `Providing student-specific help for: ${input.query}`;
});

const classRepresentativeHelpTool = ai.defineTool({
  name: 'getClassRepresentativeHelp',
  description: 'Provides information and assistance specific to class representatives.',
  inputSchema: z.object({
    query: z.string().describe('The specific question or topic the class representative needs help with.'),
  }),
  outputSchema: z.string(),
}, async (input) => {
  // Placeholder implementation for class representative help
  return `Providing class representative-specific help for: ${input.query}`;
});

const seniorHelpTool = ai.defineTool({
  name: 'getSeniorHelp',
  description: 'Provides information and assistance specific to seniors.',
  inputSchema: z.object({
    query: z.string().describe('The specific question or topic the senior needs help with.'),
  }),
  outputSchema: z.string(),
}, async (input) => {
  // Placeholder implementation for senior help
  return `Providing senior-specific help for: ${input.query}`;
});

const prompt = ai.definePrompt({
  name: 'aiPoweredCategoryHelpPrompt',
  input: { schema: AiPoweredCategoryHelpInputSchema },
  output: { schema: AiPoweredCategoryHelpOutputSchema },
  tools: [studentHelpTool, classRepresentativeHelpTool, seniorHelpTool],
  prompt: `You are an AI assistant providing help to users in different categories (Student, Class Representative, Senior).

  The user is asking for help in the following category: {{{category}}}
  The user's query is: {{{query}}}

  Based on the category and the query, use the appropriate tool to get specific information and assistance.

  {% if category === 'Student' %}
  {{ studentHelpTool.run(query=query) }}
  {% elif category === 'Class Representative' %}
  {{ classRepresentativeHelpTool.run(query=query) }}
  {% elif category === 'Senior' %}
  {{ seniorHelpTool.run(query=query) }}
  {% endif %}
  `,
});

const aiPoweredCategoryHelpFlow = ai.defineFlow(
  {
    name: 'aiPoweredCategoryHelpFlow',
    inputSchema: AiPoweredCategoryHelpInputSchema,
    outputSchema: AiPoweredCategoryHelpOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
