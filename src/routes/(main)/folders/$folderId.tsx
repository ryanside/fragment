import { createFileRoute, useParams } from '@tanstack/react-router'
import { trpc } from '@/router'
import { useQuery } from '@tanstack/react-query'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { FolderClosed, FolderOpen, ArrowLeft, Edit, Trash } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from '@tanstack/react-router'

// Define folder type based on schema
type Folder = {
  id: number;
  title: string;
  visibility: string;
  description: string | null;
  parentId: number | null;
  createdAt: string;
  updatedAt: string;
}

export const Route = createFileRoute('/(main)/folders/$folderId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { folderId } = useParams({ from: '/(main)/folders/$folderId' })
  const folderId_num = parseInt(folderId)

  const { data: folder, status: folderStatus, error: folderError } = useQuery(
    trpc.folders.getById.queryOptions(folderId_num, {
      staleTime: 8 * 1000,
    })
  ) as { data: Folder | undefined; status: 'pending' | 'error' | 'success'; error: Error | null }

  const { data: subFolders = [], status: subFoldersStatus } = useQuery(
    trpc.folders.getFoldersByParentId.queryOptions(folderId_num, {
      staleTime: 8 * 1000,
      enabled: !!folderId_num,
    })
  )

  const { data: snippets = [], status: snippetsStatus } = useQuery(
    trpc.folders.getSnippetsByFolderId.queryOptions(folderId_num, {
      staleTime: 8 * 1000,
      enabled: !!folderId_num,
    })
  )

  // Loading state
  if (folderStatus === 'pending') {
    return <div className="flex-1 grid place-items-center">Loading folder...</div>
  }

  // Error state
  if (folderStatus === 'error') {
    return <div className="flex-1 grid place-items-center text-destructive">Error: {folderError?.message}</div>
  }

  if (!folder) {
    return <div className="flex-1 grid place-items-center">Folder not found</div>
  }

  return (
    <div className="flex-1 p-6 pt-2">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/folders">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <FolderOpen className="h-6 w-6" />
          <h1 className="text-2xl">{folder.title}</h1>
        </div>
        <div className="ml-auto flex gap-2">
          <Button variant="ghost" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="ghost" size="sm" className="text-destructive">
            <Trash className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {folder.description && (
        <div className="mb-6 text-muted-foreground">{folder.description}</div>
      )}

      <div className="mb-8">
        <div className="flex items-center mb-4">
          <h2 className="text-xl font-medium">Subfolders</h2>
        </div>
        {subFoldersStatus === 'pending' ? (
          <div className="text-center py-4">Loading subfolders...</div>
        ) : !subFolders || subFolders.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">No subfolders found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subFolders.map((subFolder: {
              id: number;
              title: string;
              description: string | null;
              visibility: string;
              parentId: number | null;
              createdAt: string;
              updatedAt: string;
            }) => (
              <Card key={subFolder.id} className="hover:shadow-md transition-shadow">
                <Link 
                  to="/folders/$folderId" 
                  params={{ folderId: subFolder.id.toString() }}
                  className="block h-full"
                >
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <FolderClosed className="h-4 w-4 text-muted-foreground" />
                      <CardTitle className="text-base">{subFolder.title}</CardTitle>
                    </div>
                    {subFolder.description && (
                      <CardDescription className="text-sm">{subFolder.description}</CardDescription>
                    )}
                  </CardHeader>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Snippets in this folder */}
      <div>
        <h2 className="text-xl font-medium mb-4">Snippets in this folder</h2>
        {snippetsStatus === 'pending' ? (
          <div className="text-center py-4">Loading snippets...</div>
        ) : !snippets || snippets.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">No snippets found in this folder.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {snippets.map((snippet: {
              id: number;
              title: string;
              content: string;
              language: string;
              createdAt: string;
              updatedAt: string;
            }) => (
              <Card key={snippet.id} className="hover:shadow-md transition-shadow">
                <Link 
                  to="/snippets/$snippetId" 
                  params={{ snippetId: snippet.id.toString() }}
                  className="block h-full"
                >
                  <CardHeader>
                    <CardTitle className="text-base">{snippet.title}</CardTitle>
                    <CardDescription className="text-sm">
                      {snippet.language} • Updated {new Date(snippet.updatedAt).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
