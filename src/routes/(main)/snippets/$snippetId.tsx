import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation } from '@tanstack/react-query'
import { queryClient, trpc } from '@/router'
import { useParams } from '@tanstack/react-router'
import { useState } from 'react'
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent,
  CardFooter
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clipboard, Check, Pencil } from 'lucide-react'

export const Route = createFileRoute('/(main)/snippets/$snippetId')({
  component: RouteComponent,
})

const languages = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "jsx", label: "JSX/TSX" },
  { value: "css", label: "CSS" },
  { value: "html", label: "HTML" },
  { value: "python", label: "Python" },
  { value: "go", label: "Go" },
  { value: "ruby", label: "Ruby" },
  { value: "php", label: "PHP" },
]

// Mock data for folders, to be replaced with actual data later
const folders = [
  { id: "1", name: "None" },
  { id: "2", name: "JavaScript" },
  { id: "3", name: "React" },
  { id: "4", name: "CSS" },
  { id: "5", name: "Python" },
  { id: "6", name: "Go" },
]

// Visibility options
const visibilityOptions = [
  { value: "private", label: "Private" },
  { value: "public", label: "Public" },
]

function RouteComponent() {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  
  const snippetId = useParams({
    from: '/(main)/snippets/$snippetId',
    select: (params) => params.snippetId,
  })

  const { data: snippetData, status, error } = useQuery(
    trpc.snippets.getById.queryOptions(Number(snippetId), {
      staleTime: 8 * 1000,
    })
  )

  // The getById query returns an array, so we need to get the first item
  const snippet = snippetData ? snippetData[0] : undefined

  const updateOptions = trpc.snippets.update.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['snippets'] })
      setIsEditDialogOpen(false)
    },
  })
  const updateSnippetMutation = useMutation(updateOptions)

  const handleUpdate = (formData: FormData) => {
    if (!snippet) return

    const title = formData.get("title") as string || "untitled"
    const language = formData.get("language") as string || "plaintext"
    const description = formData.get("description") as string | null
    const content = formData.get("code") as string
    const folderIdStr = formData.get("folder") as string | null
    const tagsStr = formData.get("tags") as string | null
    const visibility = formData.get("visibility") as string || "private"
    const tags = tagsStr ? tagsStr.split(',').map(tag => tag.trim()).filter(tag => tag) : null

    // Parse folderId: Assume '1' corresponds to 'None' -> null
    let folderId: number | null = null
    if (folderIdStr && folderIdStr !== "1") {
      const parsedId = parseInt(folderIdStr, 10)
      if (!isNaN(parsedId)) {
        folderId = parsedId
      }
    }

    // Construct the object for mutation, excluding createdAt and updatedAt
    const updatedSnippetPayload = {
      id: snippet.id,
      title,
      language,
      description,
      content,
      folderId,
      tags,
      starred: snippet.starred, 
      visibility, 
    };

    // Send the actual update request
    updateSnippetMutation.mutate(updatedSnippetPayload)
  }

  if (status === 'pending') {
    return <div className="p-6">Loading...</div>
  }

  if (status === 'error') {
    return <div className="p-6">Error: {error.message}</div>
  }

  if (!snippet) {
    return <div className="p-6">Snippet not found</div>
  }

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{snippet.title}</CardTitle>
              {snippet.description && (
                <CardDescription>
                  {snippet.description}
                </CardDescription>
              )}
            </div>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setIsEditDialogOpen(true)}
            >
              <Pencil className="size-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="font-mono text-sm p-4 bg-muted/30 rounded-md overflow-auto max-h-[500px] whitespace-pre relative group">
            <div className="sticky float-right">
              <Button 
                variant="outline" 
                size="icon" 
                className="!size-7"
                onClick={() => {
                  navigator.clipboard.writeText(snippet.content)
                    .then(() => {
                      setIsCopied(true)
                      setTimeout(() => setIsCopied(false), 2000)
                    })
                }}
              >
                {isCopied ? <Check className="size-3.5" /> : <Clipboard className="size-3.5" />}
              </Button>
            </div>
            {snippet.content}
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-wrap gap-2 pt-4">
          <div className="text-xs font-medium">Language: <span className="bg-transparent outline outline-muted-foreground/20 px-2 py-1 rounded">{snippet.language}</span></div>
          {snippet.folderId && (
            <div className="text-xs font-medium">Folder ID: <span className="bg-muted px-2 py-1 rounded">{snippet.folderId}</span></div>
          )}
          {snippet.tags && snippet.tags.length > 0 && (
            <div className="text-xs font-medium">
              Tags: 
              <div className="inline-flex gap-1 ml-1">
                {snippet.tags.map((tag, index) => (
                  <span key={index} className="bg-muted/50 px-2 py-1 rounded">{tag}</span>
                ))}
              </div>
            </div>
          )}
          <div className="text-xs font-medium">
            Created: <span className="bg-muted/30 px-2 py-1 rounded">{new Date(snippet.createdAt).toLocaleString()}</span>
          </div>
          <div className="text-xs font-medium">
            Updated: <span className="bg-muted/30 px-2 py-1 rounded">{new Date(snippet.updatedAt).toLocaleString()}</span>
          </div>
        </CardFooter>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[900px]">
          <DialogHeader>
            <DialogTitle>Edit Snippet</DialogTitle>
            <DialogDescription>
              Make changes to your snippet. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          
          <form 
            onSubmit={(event) => {
              event.preventDefault();
              const formData = new FormData(event.currentTarget);
              handleUpdate(formData);
            }}
            className="space-y-4"
          >
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                placeholder="Snippet title"
                defaultValue={snippet.title}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Brief description of the snippet"
                defaultValue={snippet.description || ""}
                rows={2}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="language">Language</Label>
                <Select name="language" defaultValue={snippet.language}>
                  <SelectTrigger id="language">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="folder">Folder</Label>
                <Select name="folder" defaultValue={snippet.folderId?.toString() || "1"}>
                  <SelectTrigger id="folder">
                    <SelectValue placeholder="Select folder" />
                  </SelectTrigger>
                  <SelectContent>
                    {folders.map((folder) => (
                      <SelectItem key={folder.id} value={folder.id}>
                        {folder.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="visibility">Visibility</Label>
                <Select name="visibility" defaultValue={snippet.visibility}>
                  <SelectTrigger id="visibility">
                    <SelectValue placeholder="Select visibility" />
                  </SelectTrigger>
                  <SelectContent>
                    {visibilityOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input 
                  name="tags" 
                  placeholder="react, hooks, etc." 
                  defaultValue={snippet.tags ? snippet.tags.join(', ') : ''}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="code">Code</Label>
              <Textarea
                id="code"
                name="code"
                placeholder="Paste your code here"
                className="font-mono text-sm"
                defaultValue={snippet.content}
                rows={10}
                required
              />
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

