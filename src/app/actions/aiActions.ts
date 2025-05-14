
'use server';

import { recommendServices, type RecommendServicesInput, type RecommendServicesOutput } from '@/ai/flows/recommend-services';
import { auth } from '@/lib/firebase'; // To get current user if needed

export async function getAiServiceRecommendations(
  userId: string, 
  customHistory?: string
): Promise<{ success: boolean; recommendations?: RecommendServicesOutput; error?: string }> {
  if (!userId) {
    return { success: false, error: 'User ID is required for recommendations.' };
  }

  const bookingHistory = customHistory || "Customer enjoys styling services, hair treatments, and occasional manicures. Prefers modern looks.";

  const input: RecommendServicesInput = {
    customerId: userId,
    bookingHistory: bookingHistory,
  };

  try {
    const recommendations = await recommendServices(input);
    if (recommendations && recommendations.recommendedServices?.length > 0) {
      return { success: true, recommendations };
    } else if (recommendations) { // Case where flow returns but no specific recs
      return { 
        success: true, 
        recommendations: { 
          ...recommendations, 
          reasoning: recommendations.reasoning || "No specific recommendations found based on the provided information, but here are some general ideas.",
          recommendedServices: recommendations.recommendedServices || [] // Ensure array exists
        } 
      };
    }
    // This case should ideally not be reached if the flow always returns something
    return { success: false, error: 'Could not generate recommendations. The AI flow might have returned an unexpected result.' };
  } catch (error: any) {
    console.error("Error calling recommendServices flow:", error);
    let errorMessage = "Failed to get AI recommendations due to an unexpected error.";
    if (error.message) {
      errorMessage = error.message;
    }
    // Consider more specific error handling based on Genkit error types if available
    return { success: false, error: errorMessage };
  }
}
