
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Lightbulb, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getAiServiceRecommendations } from '@/app/actions/aiActions';
import { useAuth } from '@/hooks/use-auth';
import type { RecommendServicesOutput } from '@/ai/flows/recommend-services';

export function ServiceRecommender() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [customHistory, setCustomHistory] = useState('');
  const [recommendations, setRecommendations] = useState<RecommendServicesOutput | null>(null);
  const [isRecommending, setIsRecommending] = useState(false);

  const handleGetRecommendations = async () => {
    if (!user?.firebaseUid) {
      toast({ title: "Error", description: "You must be logged in to get recommendations.", variant: "destructive" });
      return;
    }
    setIsRecommending(true);
    setRecommendations(null); // Clear previous recommendations
    
    const result = await getAiServiceRecommendations(user.firebaseUid, customHistory || undefined);
    
    if (result.success && result.recommendations) {
      setRecommendations(result.recommendations);
      toast({ title: "Recommendations Ready!", description: "AI has suggested some services for you." });
    } else {
      toast({ title: "Recommendation Failed", description: result.error || "Could not fetch recommendations.", variant: "destructive" });
      setRecommendations(null);
    }
    setIsRecommending(false);
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl text-primary">
          <Lightbulb className="h-6 w-6" />
          AI Service Recommender
        </CardTitle>
        <CardDescription>
          Get personalized service suggestions based on your preferences or past visits.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="customHistory">Tell us about your preferences (optional):</Label>
          <Textarea
            id="customHistory"
            placeholder="e.g., 'I love vibrant hair colors and modern cuts.' or 'Looking for relaxing spa treatments.'"
            value={customHistory}
            onChange={(e) => setCustomHistory(e.target.value)}
            className="mt-1"
            disabled={isRecommending}
          />
        </div>
        <Button onClick={handleGetRecommendations} className="w-full" disabled={isRecommending || !user}>
          {isRecommending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Lightbulb className="mr-2 h-4 w-4" />
          )}
          {isRecommending ? 'Getting Suggestions...' : 'Get AI Recommendations'}
        </Button>

        {recommendations && (
          <div className="mt-6 p-4 border rounded-md bg-muted/50">
            <h4 className="font-semibold text-lg mb-2 text-foreground">Suggested Services:</h4>
            {recommendations.recommendedServices && recommendations.recommendedServices.length > 0 ? (
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                {recommendations.recommendedServices.map((service, index) => (
                  <li key={index}>{service}</li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No specific services recommended at this time.</p>
            )}
            {recommendations.reasoning && (
              <>
                <h5 className="font-semibold text-md mt-3 mb-1 text-foreground">Reasoning:</h5>
                <p className="text-sm text-muted-foreground italic">{recommendations.reasoning}</p>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
