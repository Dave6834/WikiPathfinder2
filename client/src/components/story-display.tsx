import { Card, CardContent } from "@/components/ui/card";
import { BookOpen } from "lucide-react";

interface StoryDisplayProps {
  story: string;
}

export default function StoryDisplay({ story }: StoryDisplayProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <BookOpen className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-serif text-primary">The Connection</h2>
      </div>
      
      <Card>
        <CardContent className="p-6 prose prose-primary">
          {story.split('\n').map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
