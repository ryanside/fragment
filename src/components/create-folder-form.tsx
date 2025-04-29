import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useMutation } from "@tanstack/react-query"
import { trpc } from "@/router"
import { Folder } from "@worker/db/schema"

// Visibility options
const visibilityOptions = [
  { value: "private", label: "Private" },
  { value: "public", label: "Public" },
]

export function CreateFolderForm({ onSuccess, folders }: { onSuccess: () => void, folders: Folder[] }) {
  const mutationOptions = trpc.folders.create.mutationOptions({
    onSuccess: () => {
      onSuccess();
    },
    onError: (error) => {
      console.error("Mutation error:", error);
    },
  });
  const createFolderMutation = useMutation(mutationOptions);

  const handleSubmit = (formData: FormData) => {
    const title = formData.get("title") as string || "untitled";
    const visibility = formData.get("visibility") as string || "private";
    const description = formData.get("description") as string | null;
    const parentIdStr = formData.get("parentId") as string | null;
    
    // Parse parentId
    let parentId: number | null = null;
    if (parentIdStr && parentIdStr !== "none") {
      const parsedId = parseInt(parentIdStr, 10);
      if (!isNaN(parsedId)) {
        parentId = parsedId;
      }
    }

    const folderData = {
      title,
      visibility,
      description,
      parentId,
      // Omit createdAt and updatedAt - DB will handle these via defaultNow()
    };

    createFolderMutation.mutate(folderData);
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          placeholder="Folder title"
          required
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="visibility">Visibility</Label>
          <Select name="visibility" defaultValue="private">
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
          <Label htmlFor="parentId">Parent Folder</Label>
          <Select name="parentId">
            <SelectTrigger id="parentId">
              <SelectValue placeholder="Select parent folder" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {folders.map((folder: Folder) => (
                <SelectItem key={folder.id} value={folder.id.toString()}>
                  {folder.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Brief description of the folder"
          rows={2}
        />
      </div>
      <Button type="submit" className="w-full">
        Create Folder
      </Button>
    </form>
  )
}
