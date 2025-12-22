'use server';
/**
 * @fileOverview A Genkit flow for securely validating and consuming one-time access codes.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { initAdmin } from '@/firebase/server';

// --- Input and Output Schemas ---
const ValidateAccessCodeInputSchema = z.object({
  code: z.string().describe('The access code to validate.'),
});
export type ValidateAccessCodeInput = z.infer<typeof ValidateAccessCodeInputSchema>;

const ValidateAccessCodeOutputSchema = z.object({
  isValid: z.boolean().describe('Whether the access code is valid.'),
  roles: z.array(z.string()).describe('The roles assigned to this code if valid.'),
  reason: z.string().optional().describe('The reason for validation failure.'),
});
export type ValidateAccessCodeOutput = z.infer<typeof ValidateAccessCodeOutputSchema>;


/**
 * Main exported function to be called from the client.
 * It wraps the Genkit flow, providing a clean async interface.
 */
export async function validateAccessCode(input: ValidateAccessCodeInput): Promise<ValidateAccessCodeOutput> {
  return validateAccessCodeFlow(input);
}


// --- Genkit Flow Definition ---
const validateAccessCodeFlow = ai.defineFlow(
  {
    name: 'validateAccessCodeFlow',
    inputSchema: ValidateAccessCodeInputSchema,
    outputSchema: ValidateAccessCodeOutputSchema,
  },
  async ({ code }) => {
    // Initialize the Admin SDK
    const admin = initAdmin();
    const db = getFirestore(admin);

    const accessCodeRef = db.collection('accessCodes').doc(code);

    try {
      const docSnap = await accessCodeRef.get();

      // 1. Check if the code exists
      if (!docSnap.exists) {
        return { isValid: false, roles: [], reason: 'Unauthorized access code.' };
      }

      const data = docSnap.data()!;

      // 2. Check if the code is active
      if (data.isActive === false) {
        return { isValid: false, roles: [], reason: 'This access code is no longer active.' };
      }
      
      // 3. Check if the code has been used
      if (data.used === true && data.isSingleUse === true) {
        return { isValid: false, roles: [], reason: 'This access code has already been used.' };
      }

      // 4. Check for expiration
      if (data.expiresAt && data.expiresAt instanceof Timestamp) {
        if (data.expiresAt.toMillis() < Date.now()) {
          return { isValid: false, roles: [], reason: 'This access code has expired.' };
        }
      }

      // --- Validation successful, now consume the code ---
      // For single-use codes, mark as used.
      if (data.isSingleUse === true) {
        const batch = db.batch();
        batch.update(accessCodeRef, { used: true });
        await batch.commit();
      }

      // Return a successful validation result
      return { isValid: true, roles: data.roles || [] };

    } catch (error) {
      console.error('Error validating access code:', error);
      // We return a generic error to the client to avoid leaking implementation details.
      return { isValid: false, roles: [], reason: 'An internal server error occurred during validation.' };
    }
  }
);
