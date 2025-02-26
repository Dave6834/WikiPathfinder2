import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Loader2, Shuffle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface RandomArticleResponse {
  title: string;
}

interface SearchFormProps {
  onSubmit: (data: { startWord: string; endWord: string }) => void;
  isLoading: boolean;
}

export default function SearchForm({ onSubmit, isLoading }: SearchFormProps) {
  const { toast } = useToast();
  const form = useForm({
    defaultValues: {
      startWord: "",
      endWord: ""
    }
  });

  const randomQuery = useQuery({
    queryKey: ["/api/random"],
    enabled: false,
    gcTime: 0,
    staleTime: 0,
    retry: false,
  });

  const handleRandom = async (field: "startWord" | "endWord") => {
    try {
      const result = await randomQuery.refetch();
      if (result.isError) {
        toast({
          title: "Error getting random article",
          description: result.error instanceof Error ? result.error.message : "Failed to get random article",
          variant: "destructive"
        });
        return;
      }
      if (typeof result.data === 'object' && result.data !== null && 'title' in result.data) {
        form.setValue(field, result.data.title as string);
      }
    } catch (error) {
      console.error("Failed to get random article:", error);
      toast({
        title: "Error",
        description: "Failed to get random article",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = (data: { startWord: string; endWord: string }) => {
    if (!data.startWord || !data.endWord) {
      toast({
        title: "Missing input",
        description: "Please enter both start and end articles",
        variant: "destructive"
      });
      return;
    }
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startWord"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Article</FormLabel>
                <div className="flex gap-2">
                  <FormControl>
                  <Input 
                      placeholder="Enter a Wikipedia article title" 
                      {...field} 
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(value.charAt(0).toUpperCase() + value.slice(1));
                      }}
                    />
                  </FormControl>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => handleRandom("startWord")}
                    disabled={randomQuery.isFetching}
                  >
                    {randomQuery.isFetching ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Shuffle className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endWord"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Article</FormLabel>
                <div className="flex gap-2">
                  <FormControl>
                  <Input 
                      placeholder="Enter a Wikipedia article title" 
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(value.charAt(0).toUpperCase() + value.slice(1));
                      }}
                    />
                  </FormControl>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => handleRandom("endWord")}
                    disabled={randomQuery.isFetching}
                  >
                    {randomQuery.isFetching ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Shuffle className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Find Path
        </Button>
      </form>
    </Form>
  );
}