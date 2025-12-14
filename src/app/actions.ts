'use server';

import { aiPoweredCategoryHelp, type AiPoweredCategoryHelpInput, type AiPoweredCategoryHelpOutput } from '@/ai/flows/ai-powered-category-help';

type ActionResult = AiPoweredCategoryHelpOutput & { error?: string };

export async function getHelp(input: AiPoweredCategoryHelpInput): Promise<ActionResult> {
  // Validate that the category is one of the allowed values
  const allowedCategories = ['Student', 'Class Representative', 'Senior'];
  if (!allowedCategories.includes(input.category)) {
    return { response: '', error: 'Invalid category specified.' };
  }

  try {
    const result = await aiPoweredCategoryHelp(input);
    return result;
  } catch (e: any) {
    console.error('Error in getHelp server action:', e);
    return { response: '', error: e.message || 'An unknown error occurred while contacting the AI.' };
  }
}
