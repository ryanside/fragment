import { createFileRoute } from '@tanstack/react-router'
import { trpc } from '@/router'
import { Loader2, SearchIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Link } from '@tanstack/react-router'
import { Star, ExternalLink } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'

// Define types
interface Snippet {
  id: number
  title: string
  description?: string | null
  language: string
  tags?: string[] | null
  starred?: boolean
}

export const Route = createFileRoute('/(main)/search/')({
  component: SearchPage,
})

function SearchPage() {
  // Get the search params from the URL
  const searchParams = new URLSearchParams(window.location.search)
  const queryParam = searchParams.get('q') || ''
  const [searchTerm, setSearchTerm] = useState(queryParam)
  
  // Get the search results using the tRPC endpoint
  const { data: snippets = [], status: searchStatus } = useQuery(
    trpc.search.search.queryOptions(queryParam, {
      staleTime: 10000,
      enabled: !!queryParam,
    })
  )

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      // Update the URL with the new search term
      const newUrl = `/search?q=${encodeURIComponent(searchTerm)}`
      window.history.pushState({}, '', newUrl)
      // Force a requery by reloading the page
      window.location.href = newUrl
    }
  }

  const isLoading = searchStatus === 'pending'

  return (
    <div className="container py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-4">Search Snippets</h1>
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            placeholder="Search snippets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
          <Button type="submit">
            <SearchIcon className="h-4 w-4 mr-2" />
            Search
          </Button>
        </form>
      </div>

      {queryParam ? (
        <>
          <div className="text-muted-foreground">
            {isLoading
              ? 'Searching...'
              : snippets.length === 0
              ? 'No snippets found'
              : `Found ${snippets.length} snippet${
                  snippets.length !== 1 ? 's' : ''
                }`}
          </div>

          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {snippets.map((snippet: Snippet) => (
                <Card 
                  key={snippet.id}
                  className="h-full hover:shadow-md transition-shadow"
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
                    <span className={snippet.starred ? 'text-primary' : 'text-muted-foreground'}>
                      <Star className={`size-4 ${snippet.starred ? 'fill-primary' : ''}`} />
                    </span>
                  </CardHeader>
                  <CardContent>
                    <div>
                      <div className="flex items-center justify-between gap-2 mt-2 text-xs">
                        <div className="flex items-center gap-2 flex-shrink min-w-0">
                          <div className="bg-transparent outline outline-muted-foreground/20 px-2 py-1 rounded flex-shrink-0">
                            {snippet.language}
                          </div>
                          {snippet.tags && snippet.tags.length > 0 && 
                            snippet.tags.slice(0, 2).map((tag: string, index: number) => (
                              <div key={index} className="bg-muted/50 px-2 py-1 rounded whitespace-nowrap overflow-hidden text-ellipsis">
                                {tag}
                              </div>
                            ))
                          }
                        </div>
                        <Link 
                          to="/snippets/$snippetId" 
                          params={{ snippetId: String(snippet.id) }}
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
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
          <SearchIcon className="h-12 w-12 mb-4 opacity-20" />
          <h2 className="text-xl font-medium mb-1">Search for snippets</h2>
          <p>Enter keywords to find snippets by title, language, or tags</p>
        </div>
      )}
    </div>
  )
}
