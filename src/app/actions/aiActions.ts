
'use server';

import { recommendServices, type RecommendServicesInput, type RecommendServicesOutput } from '@/ai/flows/recommend-services';
import { auth } from '@/lib/firebase'; // To get current user if needed, though flow might take userId

export async function getAiServiceRecommendations(
  userId: string, 
  customHistory?: string
): Promise<{ success: boolean; recommendations?: RecommendServicesOutput; error?: string }> {
  if (!userId) {
    return { success: false, error: 'User ID is required for recommendations.' };
  }

  // For the prototype, we'll use a generic history or a user-provided one.
  // In a real app, you'd fetch actual booking history from your database.
  const bookingHistory = customHistory || "Customer enjoys styling services, hair treatments, and occasional manicures. Prefers modern looks.";

  const input: RecommendServicesInput = {
    customerId: userId,
    bookingHistory: bookingHistory,
  };

  try {
    const recommendations = await recommendServices(input);
    if (recommendations && recommendations.recommendedServices.length > 0) {
      return { success: true, recommendations };
    } else if (recommendations) {
      return { success: true, recommendations: { ...recommendations, reasoning: recommendations.reasoning || "No specific recommendations found based on the provided information, but here are some general ideas." } };
    }
    return { success: false, error: 'Could not generate recommendations.' };
  } catch (error)
```