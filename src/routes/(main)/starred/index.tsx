import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { useQuery, useMutation } from '@tanstack/react-query'
import { trpc, queryClient } from '@/router'
import { useState } from 'react'
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Clipboard, Check, ExternalLink, Star } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import type { Snippet } from '@/types/snippet'
import { authClient } from '@/lib/auth-client'

export const Route = createFileRoute('/(main)/starred/')({
  component: RouteComponent,
  beforeLoad: async () => {
    console.log("Checking session in /(main) beforeLoad...");
    const { data: session } = await authClient.getSession();
    console.log("Session data:", session);
    if (!session) {
      console.log("No session found, redirecting to /login");
      throw redirect({ to: "/login" });
    }
    console.log("Session found, allowing access.");
  },
})

function RouteComponent() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedSnippet, setSelectedSnippet] = useState<Snippet | null>(null)
  const [isCopied, setIsCopied] = useState(false)

  const { data: snippets, status, error } = useQuery(
    trpc.snippets.getStarred.queryOptions(undefined, {
      staleTime: 8 * 1000,
    })
  )

  const handleCardClick = (snippet: Snippet) => {
    setSelectedSnippet(snippet)
    setIsDialogOpen(true)
  }

  const starSnippetMutationOptions = trpc.snippets.star.mutationOptions({
    onMutate: async ({ id }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['snippets'] })
      
      // Snapshot the previous value
      const previousSnippets = queryClient.getQueryData(['snippets.getStarred'])
      
      // Optimistically update to the new value
      queryClient.setQueryData(['snippets.getStarred'], (old: Snippet[] | undefined) => 
        old?.filter((snippet: Snippet) => snippet.id !== id)
      )
      
      // Return a context object with the snapshot
      return { previousSnippets }
    },
    onError: (_err, _variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousSnippets) {
        queryClient.setQueryData(['snippets.getStarred'], context.previousSnippets)
      }
    },
    onSettled: () => {
      // Always refetch after error or success to ensure data is in sync
      queryClient.invalidateQueries({ queryKey: ['snippets'] })
      queryClient.invalidateQueries({ queryKey: ['snippets.getStarred'] })
    },
  })
  
  const starSnippetMutation = useMutation(starSnippetMutationOptions)

  const handleStarClick = (e: React.MouseEvent, snippetId: number, currentStarred: boolean) => {
    e.stopPropagation() // Prevent card click when star is clicked
    starSnippetMutation.mutate({ id: snippetId, starred: !currentStarred })
  }

  if (status === 'pending') {
    return (
      <div className="flex-1 p-6 pt-2">
        <h1 className="text-2xl mb-6 pl-1">Starred Snippets</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(5)].map((_, index) => (
            <Card key={index} className="h-full">
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2 mt-2" />
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2">
                  <div className="text-xs text-muted-foreground font-medium">Code excerpt:</div>
                  <div className="overflow-hidden font-mono text-sm text-muted-foreground bg-muted/30 p-2 rounded-md border-l-2 border-primary/50 relative max-h-16">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4 mt-1" />
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return <div className="flex-1 flex items-center justify-center text-destructive">Error: {error.message}</div>
  }
  
  return (
    <div className="flex-1 p-6 pt-2">
      <h1 className="text-2xl mb-6 pl-1">Starred Snippets</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {snippets?.length === 0 ? (
          <div className="col-span-full text-center py-10 text-muted-foreground">
            No starred snippets found. Star a snippet to add it to this list.
          </div>
        ) : (
          snippets?.map((snippet) => (
            <Card 
              key={snippet.id}
              className="h-full hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleCardClick(snippet)}
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
                  onClick={(e) => handleStarClick(e, snippet.id, true)}
                >
                  <Star className="size-4 fill-primary text-primary" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2">
                  <div className="text-xs text-muted-foreground font-medium">Code excerpt:</div>
                  <div className="overflow-hidden font-mono text-sm text-muted-foreground bg-muted/30 p-2 rounded-md border-l-2 border-primary/50 relative max-h-16">
                    <div className="overflow-hidden text-ellipsis whitespace-pre line-clamp-2">
                      {snippet.content.slice(0, 150)}
                    </div>
                    {snippet.content.length > 150 && (
                      <div className="absolute bottom-0 right-0 bg-gradient-to-l from-muted/80 to-transparent px-2 text-xs font-medium">
                        ...more
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-2 text-xs">
                    <div className="flex items-center gap-2 flex-shrink min-w-0 ">
                      <div className="bg-transparent outline outline-muted-foreground/20 px-2 py-1 rounded flex-shrink-0">{snippet.language}</div>
                      {snippet.tags && snippet.tags.length > 0 && 
                        snippet.tags.slice(0, 2).map((tag: string, index: number) => (
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
          ))
        )}
      </div>

      {selectedSnippet && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[900px]">
            <DialogHeader className="flex flex-row items-start justify-between">
              <div>
                <DialogTitle>{selectedSnippet.title}</DialogTitle>
                {selectedSnippet.description && (
                  <DialogDescription>
                    {selectedSnippet.description}
                  </DialogDescription>
                )}
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={(e) => handleStarClick(e, selectedSnippet.id, true)}
                className="!size-8 -mr-2 -mt-2"
              >
                <Star className="size-4 fill-primary text-primary" />
              </Button>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="font-mono text-sm p-4 bg-muted/30 rounded-md overflow-auto max-h-[500px] whitespace-pre relative group">
                <div className="sticky float-right">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="!size-7"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigator.clipboard.writeText(selectedSnippet.content)
                        .then(() => {
                          setIsCopied(true);
                          setTimeout(() => setIsCopied(false), 2000);
                        });
                    }}
                  >
                    {isCopied ? (
                      <>
                        <Check className="size-3.5" />
                      </>
                    ) : (
                      <>
                        <Clipboard className="size-3.5" />
                      </>
                    )}
                  </Button>
                </div>
                {selectedSnippet.content}
              </div>
              
              <div className="flex flex-wrap gap-2 mt-2">
                <div className="text-xs font-medium">Language: <span className="bg-transparent outline outline-muted-foreground/20 px-2 py-1 rounded">{selectedSnippet.language}</span></div>
                {selectedSnippet.folderId && (
                  <div className="text-xs font-medium">Folder ID: <span className="bg-muted px-2 py-1 rounded">{selectedSnippet.folderId}</span></div>
                )}
                {selectedSnippet.tags && selectedSnippet.tags.length > 0 && (
                  <div className="text-xs font-medium">
                    Tags: 
                    <div className="inline-flex gap-1 ml-1">
                      {selectedSnippet.tags.map((tag: string, index: number) => (
                        <span key={index} className="bg-muted/50 px-2 py-1 rounded">{tag}</span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="text-xs font-medium">
                  Created: <span className="bg-muted/30 px-2 py-1 rounded">{new Date(selectedSnippet.createdAt).toLocaleString()}</span>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Link 
                to="/snippets/$snippetId" 
                params={{ snippetId: String(selectedSnippet.id) }}
                onClick={() => setIsDialogOpen(false)}
              >
                <Button variant="secondary">
                  Go to Snippet Page
                </Button>
              </Link>
              <Button 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
