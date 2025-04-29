import { createFileRoute } from '@tanstack/react-router'
import { trpc } from '@/router'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FolderClosed, FolderPlus } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { CreateFolderForm } from '@/components/create-folder-form'
import { useNavigate } from '@tanstack/react-router'

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

export const Route = createFileRoute('/(main)/folders/')({
  component: RouteComponent,
})

function RouteComponent() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const navigate = useNavigate()
  
  const { data: folders = [], status, error } = useQuery(
    trpc.folders.getAll.queryOptions(undefined, {
      staleTime: 8 * 1000,
    })
  )

  const handleCardClick = (folder: Folder) => {
    navigate({ to: '/folders/$folderId', params: { folderId: folder.id.toString() } })
  }

  const handleCreateSuccess = () => {
    setIsDialogOpen(false)
  }

  if (status === 'pending') {
    return <div className="flex-1 grid place-items-center">Loading...</div>
  }

  if (status === 'error') {
    return <div className="flex-1 grid place-items-center text-destructive">Error: {error?.message}</div>
  }

  return (
    <div className="flex-1 p-6 pt-2">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl pl-1">Folders</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <FolderPlus className="h-4 w-4 mr-2" />
              <span>New Folder</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Folder</DialogTitle>
            </DialogHeader>
            <CreateFolderForm onSuccess={handleCreateSuccess} />
          </DialogContent>
        </Dialog>
      </div>
    
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {folders.length === 0 ? (
          <div className="col-span-full text-center py-10 text-muted-foreground">
            No folders found. Create your first folder to get started.
          </div>
        ) : (
          folders.map((folder: Folder) => (
            <Card 
              key={folder.id}
              className="h-full hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleCardClick(folder)}
            >
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FolderClosed className="h-5 w-5 text-muted-foreground" />
                  <CardTitle>{folder.title}</CardTitle>
                </div>
                {folder.description && (
                  <CardDescription>
                    {folder.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardFooter className="text-sm text-muted-foreground">
                <div className="flex flex-wrap gap-2 pt-1">
                  <div className="text-xs">
                    Visibility: <span className="bg-muted/50 px-2 py-1 rounded">{folder.visibility}</span>
                  </div>
                  {folder.parentId && (
                    <div className="text-xs">
                      Parent: <span className="bg-muted/50 px-2 py-1 rounded">{folder.parentId}</span>
                    </div>
                  )}
                </div>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
