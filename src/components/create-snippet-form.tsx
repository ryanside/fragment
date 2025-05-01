import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useMutation } from "@tanstack/react-query"
import { trpc } from "@/router"
import { Folder } from "@worker/db/schema"
import { authClient } from "@/lib/auth-client";
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

// Visibility options
const visibilityOptions = [
  { value: "private", label: "Private" },
  { value: "public", label: "Public" },
]

export function CreateSnippetForm({ onSuccess, folders }: { onSuccess: () => void, folders: Folder[] }) {
  const { data: session } = authClient.useSession();
  const mutationOptions = trpc.snippets.create.mutationOptions({
    onSuccess: () => {
      onSuccess();
    },
    onError: (error) => {
      console.error("Mutation error:", error);
    },
  });
  const createSnippetMutation = useMutation(mutationOptions);

  const handleSubmit = (formData: FormData) => {
    const title = formData.get("title") as string || "untitled";
    const language = formData.get("language") as string || "plaintext";
    const description = formData.get("description") as string | null;
    const content = formData.get("code") as string; // Content is required
    const folderIdStr = formData.get("folder") as string | null;
    const tagsStr = formData.get("tags") as string | null;
    const visibility = formData.get("visibility") as string || "private";
    const tags = tagsStr ? tagsStr.split(',').map(tag => tag.trim()).filter(tag => tag) : null;

    // Validate required fields
    if (!content) {
      console.error("Code content is required.");
      // Handle error appropriately, e.g., show a message to the user
      return;
    }

    // Parse folderId: Assume '1' corresponds to 'None' -> null
    let folderId: number | null = null;
    if (folderIdStr && folderIdStr !== "1") { // Check if it's not null and not the 'None' value
      const parsedId = parseInt(folderIdStr, 10);
      if (!isNaN(parsedId)) {
        folderId = parsedId;
      }
    }

    const snippetData = {
      title,
      userId: session?.user.id ?? '',
      visibility,
      language,
      description,
      content,
      folderId, // Use the parsed value
      tags,
      starred: false, 
      // Omit createdAt and updatedAt - DB will handle these via defaultNow()
    };

    createSnippetMutation.mutate(snippetData);
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          placeholder="Snippet title"
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Brief description of the snippet"
          rows={2}
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="language">Language</Label>
          <Select name="language">
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
          <Select name="folder">
            <SelectTrigger id="folder">
              <SelectValue placeholder="Select folder" />
            </SelectTrigger>
            <SelectContent>
              {folders.map((folder) => (
                <SelectItem key={folder.id} value={folder.id.toString()}>
                  {folder.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
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
          <Label htmlFor="tags">Tags (comma separated)</Label>
          <Input name="tags" placeholder="react, hooks, etc." />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="code">Code</Label>
        <Textarea
          id="code"
          name="code"
          placeholder="Paste your code here"
          className="font-mono text-sm"
          rows={10}
        />
      </div>
      <Button type="submit" className="w-full">
        Create Snippet
      </Button>
    </form>
  )
}
