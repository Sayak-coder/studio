/**
 * @fileoverview A flow that provides helpful information about a category by calling the Gemini API directly.
 */
'use server';

// Define the expected input and output types for clarity.
export type CategoryHelpInput = {
  category: string;
};

export type CategoryHelpOutput = {
  description: string;
  relatedTopics: string[];
};

/**
 * Calls the Google Gemini API directly to get a description and related topics for a given category.
 * @param input The category to get help with.
 * @returns A promise that resolves to the structured output from the AI.
 */
export async function categoryHelpFlow(input: CategoryHelpInput): Promise<CategoryHelpOutput> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set in the environment.');
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const prompt = `
    You are an expert academic assistant. The user wants to learn about a topic.
    Provide a concise, helpful description of the topic: "${input.category}".
    Also, provide a short list of 3-5 related topics they might find interesting.
    
    Return the output as a valid JSON object with the following structure:
    {
      "description": "...",
      "relatedTopics": ["...", "..."]
    }
  `;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ]
      })
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Gemini API Error:', errorBody);
      throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    const textContent = data.candidates[0]?.content?.parts[0]?.text;
    if (!textContent) {
      throw new Error('Invalid response structure from Gemini API.');
    }

    // Clean the text and parse it as JSON
    const jsonString = textContent.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsedOutput: CategoryHelpOutput = JSON.parse(jsonString);

    return parsedOutput;

  } catch (err: any) {
    console.error("Failed to call Gemini API:", err);
    throw new Error(`Failed to get AI help: ${err.message}`);
  }
}
