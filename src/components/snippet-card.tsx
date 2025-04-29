import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { ExternalLink, Star } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { trpc, queryClient } from "@/router";
import type { Snippet } from "@/types/snippet";

interface SnippetCardProps {
  snippet: Snippet;
  onClick?: (snippet: Snippet) => void;
}

export function SnippetCard({ snippet, onClick }: SnippetCardProps) {
  const starSnippetMutationOptions = trpc.snippets.star.mutationOptions({
    onMutate: async ({ id, starred }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['snippets'] })
      
      // Snapshot the previous value
      const previousSnippets = queryClient.getQueryData(['snippets'])
      
      // Optimistically update to the new value
      queryClient.setQueryData(['snippets'], (old: Snippet[] | undefined) => 
        old?.map((s: Snippet) => 
          s.id === id ? { ...s, starred } : s
        )
      )
      
      // Return a context object with the snapshot
      return { previousSnippets }
    },
    onSettled: () => {
      // Always refetch after error or success to ensure data is in sync
      queryClient.invalidateQueries({ queryKey: ['snippets'] })
    },
    onError: (_err, _variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousSnippets) {
        queryClient.setQueryData(['snippets'], context.previousSnippets)
      }
    },
  })
  
  const starSnippetMutation = useMutation(starSnippetMutationOptions)

  const handleStarClick = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent card click when star is clicked
    starSnippetMutation.mutate({ id: snippet.id, starred: !snippet.starred })
  }

  return (
    <Card 
      className="h-full hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick ? () => onClick(snippet) : undefined}
    >
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle>{snippet.title}</CardTitle>
          {snippet.description && (
            <CardDescription>
              {snippet.description}
            </CardDescription>
          )}
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="!size-8 -mr-2 -mt-1"
          onClick={handleStarClick}
        >
          <Star className={`size-4 ${snippet.starred ? 'fill-primary text-primary' : 'text-muted-foreground'}`} />
        </Button>
      </CardHeader>
      <CardContent>
        <div>
          <div className="flex items-center justify-between gap-2 mt-2 text-xs">
            <div className="flex items-center gap-2 flex-shrink min-w-0">
              <div className="bg-transparent outline outline-muted-foreground/20 px-2 py-1 rounded flex-shrink-0">{snippet.language}</div>
              {snippet.tags && snippet.tags.length > 0 && 
                snippet.tags.slice(0, 2).map((tag, index) => (
                  <div key={index} className="bg-muted/50 px-2 py-1 rounded whitespace-nowrap overflow-hidden text-ellipsis">{tag}</div>
                ))
              }
            </div>
            <Link 
              to="/snippets/$snippetId" 
              params={{ snippetId: String(snippet.id) }} 
              onClick={(e) => e.stopPropagation()}
              className="text-muted-foreground hover:text-foreground flex-shrink-0"
            >
              <Button variant="ghost" size="icon" className="!size-7">
                <ExternalLink className="size-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 