import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import SearchForm from "@/components/search-form";
import PathDisplay from "@/components/path-display";
import StoryDisplay from "@/components/story-display";
import { Card } from "@/components/ui/card";
import type { Search } from "@shared/schema";

export default function Home() {
  const [result, setResult] = useState<Search | null>(null);
  const { toast } = useToast();

  const searchMutation = useMutation({
    mutationFn: async (data: { startWord: string; endWord: string }) => {
      try {
        const res = await apiRequest("POST", "/api/search", data);
        const jsonData = await res.json();

        if ('error' in jsonData) {
          throw new Error(jsonData.message || jsonData.error);
        }

        if (!jsonData.path || jsonData.path.length === 0) {
          throw new Error("No path found between these articles");
        }

        return jsonData as Search;
      } catch (error) {
        let message = "Failed to find path between articles";
        if (error instanceof Error) {
          message = error.message;
          // Make timeout messages more user-friendly
          if (message.includes("timed out")) {
            message = "Search took too long. Try articles that might be more closely related.";
          }
        }
        throw new Error(message);
      }
    },
    onSuccess: (data: Search) => {
      setResult(data);
      toast({
        title: "Path found!",
        description: `Found a path with ${data.path.length} steps.`,
      });
    },
    onError: (error: Error) => {
      setResult(null);
      toast({
        title: "Search failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-serif text-primary">Wikipedia Pathfinder</h1>
          <p className="text-muted-foreground">
            Discover the hidden connections between Wikipedia articles
          </p>
        </div>

        <Card className="p-6">
          <SearchForm
            onSubmit={(data) => searchMutation.mutate(data)}
            isLoading={searchMutation.isPending}
          />
        </Card>

        {result && (
          <div className="space-y-8">
            <PathDisplay path={result.path} />
            <StoryDisplay story={result.story} />
          </div>
        )}
      </div>
    </div>
  );
}