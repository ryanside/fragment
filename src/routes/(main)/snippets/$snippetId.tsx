import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, trpc } from "@/router";
import { useParams } from "@tanstack/react-router";
import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Clipboard, Check, Pencil, Bot } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Skeleton } from "@/components/ui/skeleton";
import { useChat } from "@ai-sdk/react";
import Markdown from "react-markdown";

export const Route = createFileRoute("/(main)/snippets/$snippetId")({
  component: RouteComponent,
});

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
];

// Visibility options
const visibilityOptions = [
  { value: "private", label: "Private" },
  { value: "public", label: "Public" },
];

function RouteComponent() {
  const { messages, append } = useChat();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isExplainDialogOpen, setIsExplainDialogOpen] = useState(false);
  const { data: session } = authClient.useSession();
  const snippetId = useParams({
    from: "/(main)/snippets/$snippetId",
    select: (params) => params.snippetId,
  });

  // Always fetch visibility
  const { data: visibility } = useQuery(
    trpc.snippets.getVisibility.queryOptions(Number(snippetId))
  );

  // Always fetch public snippet data
  const publicSnippetQuery = useQuery(
    trpc.snippets.getPublic.queryOptions(Number(snippetId))
  );

  // Always fetch user's snippet data and folders, but with empty/disabled queries if not logged in
  const snippetQuery = useQuery(
    trpc.snippets.getById.queryOptions(
      {
        id: Number(snippetId),
        userId: session?.user.id ?? "",
      },
      {
        staleTime: 8 * 1000,
        enabled: !!session,
      }
    )
  );

  // Always fetch folders if logged in
  const foldersQuery = useQuery(
    trpc.folders.getAll.queryOptions(session?.user.id ?? "", {
      staleTime: 8 * 1000,
      enabled: !!session,
    })
  );

  // For authenticated users viewing their snippets
  const snippet = snippetQuery.data?.[0];
  const foldersData = foldersQuery.data;

  // For non-authenticated users viewing public snippets
  const publicSnippet = publicSnippetQuery.data;

  // Update mutation remains the same
  const updateOptions = trpc.snippets.update.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["snippetData"] });
      setIsEditDialogOpen(false);
    },
  });
  const updateSnippetMutation = useMutation(updateOptions);

  const handleUpdate = (formData: FormData) => {
    if (!snippet) return;

    const title = (formData.get("title") as string) || "untitled";
    const language = (formData.get("language") as string) || "plaintext";
    const description = formData.get("description") as string | null;
    const content = formData.get("code") as string;
    const folderIdStr = formData.get("folder") as string | null;
    const tagsStr = formData.get("tags") as string | null;
    const visibility = (formData.get("visibility") as string) || "private";
    const tags = tagsStr
      ? tagsStr
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag)
      : null;

    // Parse folderId: Assume '1' corresponds to 'None' -> null
    let folderId: number | null = null;
    if (folderIdStr && folderIdStr !== "1") {
      const parsedId = parseInt(folderIdStr, 10);
      if (!isNaN(parsedId)) {
        folderId = parsedId;
      }
    }

    // Construct the object for mutation, excluding createdAt and updatedAt
    const updatedSnippetPayload = {
      id: snippet.id,
      userId: session?.user.id ?? "",
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
    updateSnippetMutation.mutate(updatedSnippetPayload);
  };

  // Handling for non-authenticated users viewing public snippets
  if (!session) {
    if (!visibility) {
      return <div className="p-6">You do not have access to this snippet</div>;
    }

    if (publicSnippetQuery.status === "pending") {
      return (
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle className="w-1/2">
                <Skeleton className="h-6" />
              </CardTitle>
              <CardDescription className="w-3/4">
                <Skeleton className="h-4" />
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px]" />
            </CardContent>
          </Card>
        </div>
      );
    }

    if (publicSnippetQuery.status === "error") {
      return (
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle>Error</CardTitle>
              <CardDescription>
                {publicSnippetQuery.error.message}
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      );
    }

    if (!publicSnippet) {
      return (
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle>Not Found</CardTitle>
              <CardDescription>
                The requested snippet could not be found
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      );
    }

    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{publicSnippet.title}</CardTitle>
                {publicSnippet.description && (
                  <CardDescription>{publicSnippet.description}</CardDescription>
                )}
              </div>
              <Button
                variant="outline"
                size="icon"
                className="size-8"
                onClick={() => {
                  setIsCopied(true);
                  setTimeout(() => setIsCopied(false), 2000);
                }}
              >
                {isCopied ? (
                  <Check className="size-4" />
                ) : (
                  <Clipboard className="size-4" />
                )}
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            <div className="font-mono text-sm p-4 bg-muted/30 rounded-md overflow-auto max-h-[500px] whitespace-pre relative">
              {publicSnippet.content}
            </div>
          </CardContent>

          <CardFooter className="flex flex-wrap gap-2 pt-4">
            <div className="text-xs font-medium">
              Language:{" "}
              <span className="bg-transparent outline outline-muted-foreground/20 px-2 py-1 rounded">
                {publicSnippet.language}
              </span>
            </div>
            {publicSnippet.folderId && (
              <div className="text-xs font-medium">
                Folder ID:{" "}
                <span className="bg-muted px-2 py-1 rounded">
                  {publicSnippet.folderId}
                </span>
              </div>
            )}
            {publicSnippet.tags && publicSnippet.tags.length > 0 && (
              <div className="text-xs font-medium">
                Tags:
                <div className="inline-flex gap-1 ml-1">
                  {publicSnippet.tags.map((tag, index) => (
                    <span key={index} className="bg-muted/50 px-2 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div className="text-xs font-medium">
              Created:{" "}
              <span className="bg-muted/30 px-2 py-1 rounded">
                {new Date(publicSnippet.createdAt).toLocaleString()}
              </span>
            </div>
            <div className="text-xs font-medium">
              Updated:{" "}
              <span className="bg-muted/30 px-2 py-1 rounded">
                {new Date(publicSnippet.updatedAt).toLocaleString()}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="ml-auto"
              onClick={() => {
                const assistantMessageExists = messages.some(
                  (m) => m.role === "assistant"
                );
                if (!assistantMessageExists) {
                  append({
                    role: "user",
                    content: publicSnippet?.content ?? "",
                  });
                }
                setIsExplainDialogOpen(true);
              }}
            >
              <Bot className="mr-2 size-4" /> Explain with AI
            </Button>
          </CardFooter>
        </Card>
        <Dialog
          open={isExplainDialogOpen}
          onOpenChange={setIsExplainDialogOpen}
        >
          <DialogContent className="sm:max-w-[1000px]">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <Bot className="mr-2 size-5" /> AI Explanation
              </DialogTitle>
              <DialogDescription>Using Gemini 2.0 Flash</DialogDescription>
            </DialogHeader>
            <div className="prose dark:prose-invert max-w-none max-h-[60vh] overflow-y-auto py-4">
              {messages
                .filter((m) => m.role === "assistant")
                .map((m) => (
                  <Markdown key={m.id}>{m.content || "Generating..."}</Markdown>
                ))}
              {!messages.some((m) => m.role === "assistant") && (
                <p>Generating explanation...</p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Handling for authenticated users
  if (snippetQuery?.status === "pending") {
    return <div className="p-6">Loading...</div>;
  }

  if (snippetQuery?.status === "error") {
    return <div className="p-6">Error: {snippetQuery.error.message}</div>;
  }

  if (publicSnippet) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{publicSnippet.title}</CardTitle>
                {publicSnippet.description && (
                  <CardDescription>{publicSnippet.description}</CardDescription>
                )}
              </div>
              <Button
                variant="outline"
                size="icon"
                className="size-8"
                onClick={() => {
                  setIsCopied(true);
                  setTimeout(() => setIsCopied(false), 2000);
                }}
              >
                {isCopied ? (
                  <Check className="size-4" />
                ) : (
                  <Clipboard className="size-4" />
                )}
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            <div className="font-mono text-sm p-4 bg-muted/30 rounded-md overflow-auto max-h-[500px] whitespace-pre relative">
              {publicSnippet.content}
            </div>
          </CardContent>

          <CardFooter className="flex flex-wrap gap-2 pt-4">
            <div className="text-xs font-medium">
              Language:{" "}
              <span className="bg-transparent outline outline-muted-foreground/20 px-2 py-1 rounded">
                {publicSnippet.language}
              </span>
            </div>
            {publicSnippet.folderId && (
              <div className="text-xs font-medium">
                Folder ID:{" "}
                <span className="bg-muted px-2 py-1 rounded">
                  {publicSnippet.folderId}
                </span>
              </div>
            )}
            {publicSnippet.tags && publicSnippet.tags.length > 0 && (
              <div className="text-xs font-medium">
                Tags:
                <div className="inline-flex gap-1 ml-1">
                  {publicSnippet.tags.map((tag, index) => (
                    <span key={index} className="bg-muted/50 px-2 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div className="text-xs font-medium">
              Created:{" "}
              <span className="bg-muted/30 px-2 py-1 rounded">
                {new Date(publicSnippet.createdAt).toLocaleString()}
              </span>
            </div>
            <div className="text-xs font-medium">
              Updated:{" "}
              <span className="bg-muted/30 px-2 py-1 rounded">
                {new Date(publicSnippet.updatedAt).toLocaleString()}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="ml-auto"
              onClick={() => {
                const assistantMessageExists = messages.some(
                  (m) => m.role === "assistant"
                );
                if (!assistantMessageExists) {
                  append({
                    role: "user",
                    content: publicSnippet?.content ?? "",
                  });
                }
                setIsExplainDialogOpen(true);
              }}
            >
              <Bot className="mr-2 size-4" /> Explain with AI
            </Button>
          </CardFooter>
        </Card>
        <Dialog
          open={isExplainDialogOpen}
          onOpenChange={setIsExplainDialogOpen}
        >
          <DialogContent className="sm:max-w-[1000px]">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <Bot className="mr-2 size-5" /> AI Explanation
              </DialogTitle>
              <DialogDescription>Using Gemini 2.0 Flash</DialogDescription>
            </DialogHeader>
            <div className="prose dark:prose-invert max-w-none max-h-[60vh] overflow-y-auto py-4">
              {messages
                .filter((m) => m.role === "assistant")
                .map((m) => (
                  <Markdown key={m.id}>{m.content || "Generating..."}</Markdown>
                ))}
              {!messages.some((m) => m.role === "assistant") && (
                <p>Generating explanation...</p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  if (!snippet) {
    return <div className="p-6">Snippet not found</div>;
  }

  // Rest of authenticated user UI remains the same
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{snippet.title}</CardTitle>
              {snippet.description && (
                <CardDescription>{snippet.description}</CardDescription>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                className="size-8"
                onClick={() => {
                  navigator.clipboard.writeText(snippet.content).then(() => {
                    setIsCopied(true);
                    setTimeout(() => setIsCopied(false), 2000);
                  });
                }}
              >
                {isCopied ? (
                  <Check className="size-4" />
                ) : (
                  <Clipboard className="size-4" />
                )}
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="size-8"
                onClick={() => setIsEditDialogOpen(true)}
              >
                <Pencil className="size-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="font-mono text-sm p-4 bg-muted/30 rounded-md overflow-auto max-h-[500px] whitespace-pre relative">
            {snippet.content}
          </div>
        </CardContent>

        <CardFooter className="flex flex-wrap gap-2 pt-4">
          <div className="text-xs font-medium">
            Language:{" "}
            <span className="bg-transparent outline outline-muted-foreground/20 px-2 py-1 rounded">
              {snippet.language}
            </span>
          </div>
          {snippet.folderId && (
            <div className="text-xs font-medium">
              Folder ID:{" "}
              <span className="bg-muted px-2 py-1 rounded">
                {snippet.folderId}
              </span>
            </div>
          )}
          {snippet.tags && snippet.tags.length > 0 && (
            <div className="text-xs font-medium">
              Tags:
              <div className="inline-flex gap-1 ml-1">
                {snippet.tags?.map((tag, index) => (
                  <span key={index} className="bg-muted/50 px-2 py-1 rounded">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
          <div className="text-xs font-medium">
            Created:{" "}
            <span className="bg-muted/30 px-2 py-1 rounded">
              {new Date(snippet.createdAt).toLocaleString()}
            </span>
          </div>
          <div className="text-xs font-medium">
            Updated:{" "}
            <span className="bg-muted/30 px-2 py-1 rounded">
              {new Date(snippet.updatedAt).toLocaleString()}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="ml-auto"
            onClick={() => {
              const assistantMessageExists = messages.some(
                (m) => m.role === "assistant"
              );
              if (!assistantMessageExists) {
                append({ role: "user", content: snippet?.content ?? "" });
              }
              setIsExplainDialogOpen(true);
            }}
          >
            <Bot className="mr-2 size-4" /> Explain with AI
          </Button>
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
                <Select name="folder">
                  <SelectTrigger id="folder">
                    <SelectValue placeholder="Select folder" />
                  </SelectTrigger>
                  <SelectContent>
                    {foldersData?.map((folder) => (
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
                  defaultValue={snippet.tags ? snippet.tags.join(", ") : ""}
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
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isExplainDialogOpen} onOpenChange={setIsExplainDialogOpen}>
        <DialogContent className="sm:max-w-[1000px]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Bot className="mr-2 size-5" /> AI Explanation
            </DialogTitle>
            <DialogDescription>Using Gemini 2.0 Flash</DialogDescription>
          </DialogHeader>
          <div className="prose dark:prose-invert max-w-none max-h-[60vh] overflow-y-auto py-4">
            {messages
              .filter((m) => m.role === "assistant")
              .map((m) => (
                <Markdown key={m.id}>{m.content || "Generating..."}</Markdown>
              ))}
            {!messages.some((m) => m.role === "assistant") && (
              <p>Generating explanation...</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
