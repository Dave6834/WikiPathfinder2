import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";

interface PathDisplayProps {
  path: string[];
}

export default function PathDisplay({ path }: PathDisplayProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-serif text-primary">Path Found</h2>
      <div className="flex flex-wrap items-center gap-2">
        {path.map((article, index) => (
          <div key={article} className="flex items-center">
            <Card className="bg-card hover:bg-accent transition-colors">
              <CardContent className="p-4">
                <a
                  href={`https://en.wikipedia.org/wiki/${encodeURIComponent(article)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground hover:text-primary transition-colors"
                >
                  {article}
                </a>
              </CardContent>
            </Card>
            {index < path.length - 1 && (
              <ChevronRight className="mx-2 text-muted-foreground" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}