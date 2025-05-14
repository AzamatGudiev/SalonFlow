'use server';

/**
 * @fileOverview Service recommendation AI agent.
 *
 * - recommendServices - A function that recommends services based on customer history.
 * - RecommendServicesInput - The input type for the recommendServices function.
 * - RecommendServicesOutput - The return type for the recommendServices function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecommendServicesInputSchema = z.object({
  customerId: z.string().describe('The ID of the customer.'),
  bookingHistory: z
    .string()
    .describe(
      'A summary of the customer booking history, including services booked and any notes about preferences.'
    ),
});
export type RecommendServicesInput = z.infer<typeof RecommendServicesInputSchema>;

const RecommendServicesOutputSchema = z.object({
  recommendedServices: z
    .array(z.string())
    .describe('A list of recommended services based on booking history.'),
  reasoning: z
    .string()
    .describe('Explanation of why these services are recommended.'),
});
export type RecommendServicesOutput = z.infer<typeof RecommendServicesOutputSchema>;

export async function recommendServices(
  input: RecommendServicesInput
): Promise<RecommendServicesOutput> {
  return recommendServicesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recommendServicesPrompt',
  input: {schema: RecommendServicesInputSchema},
  output: {schema: RecommendServicesOutputSchema},
  prompt: `You are a service recommendation expert for a salon.

Based on the customer's booking history, recommend services they might be interested in.

Customer Booking History: {{{bookingHistory}}}

Consider the customer's past services and preferences when making your recommendations. Try to include several services in the recommendation.

Return the list of recommended services and the reasoning behind your suggestions.
`,
});

const recommendServicesFlow = ai.defineFlow(
  {
    name: 'recommendServicesFlow',
    inputSchema: RecommendServicesInputSchema,
    outputSchema: RecommendServicesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
