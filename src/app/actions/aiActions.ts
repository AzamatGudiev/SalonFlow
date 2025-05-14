
'use server';

import { recommendServices, type RecommendServicesInput, type RecommendServicesOutput } from '@/ai/flows/recommend-services';
// import { auth } from '@/lib/firebase'; // Not strictly needed here as UID is passed

export async function getAiServiceRecommendations(
  userId: string, 
  customHistory?: string
): Promise<{ success: boolean; recommendations?: RecommendServicesOutput; error?: string }> {
  if (!userId) {
    return { success: false, error: 'User ID is required for recommendations.' };
  }

  // Use a default history if none is provided, or use the custom one.
  const bookingHistory = customHistory || "Customer enjoys styling services, hair treatments, and occasional manicures. Prefers modern looks.";

  const input: RecommendServicesInput = {
    customerId: userId,
    bookingHistory: bookingHistory,
  };

  try {
    const recommendations = await recommendServices(input);
    
    // Ensure the flow always returns a well-structured object even if no specific recommendations are found
    if (recommendations) {
        const result: RecommendServicesOutput = {
            recommendedServices: recommendations.recommendedServices || [],
            reasoning: recommendations.reasoning || (recommendations.recommendedServices?.length ? "Based on your input." : "No specific recommendations found, consider exploring our services!"),
        };
      return { success: true, recommendations: result };
    }
    // This case should ideally not be reached if the flow always returns something structured.
    return { success: false, error: 'Could not generate recommendations. The AI flow might have returned an unexpected result.' };
  } catch (error: any) {
    console.error("Error calling recommendServices flow:", error);
    let errorMessage = "Failed to get AI recommendations due to an unexpected error.";
    if (error.message) {
      errorMessage = `AI Recommendation Error: ${error.message}`;
    }
    return { success: false, error: errorMessage };
  }
}
