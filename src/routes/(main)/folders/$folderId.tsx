import { createFileRoute, useParams, useNavigate, redirect } from "@tanstack/react-router";
import { trpc, queryClient } from "@/router";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { FolderClosed, FolderOpen, ArrowLeft, Edit, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";

// Define folder type based on schema
type Folder = {
  id: number;
  title: string;
  visibility: string;
  description: string | null;
  parentId: number | null;
  createdAt: string;
  updatedAt: string;
};

export const Route = createFileRoute("/(main)/folders/$folderId")({
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
});

function RouteComponent() {
  const { folderId } = useParams({ from: "/(main)/folders/$folderId" });
  const folderId_num = parseInt(folderId);
  const navigate = useNavigate();
  const {
    data: folder,
    status: folderStatus,
    error: folderError,
  } = useQuery(
    trpc.folders.getById.queryOptions(folderId_num, {
      staleTime: 8 * 1000,
    })
  ) as {
    data: Folder | undefined;
    status: "pending" | "error" | "success";
    error: Error | null;
  };

  const { data: subFolders = [], status: subFoldersStatus } = useQuery(
    trpc.folders.getFoldersByParentId.queryOptions(folderId_num, {
      staleTime: 8 * 1000,
      enabled: !!folderId_num,
    })
  );

  const { data: snippets = [], status: snippetsStatus } = useQuery(
    trpc.folders.getSnippetsByFolderId.queryOptions(folderId_num, {
      staleTime: 8 * 1000,
      enabled: !!folderId_num,
    })
  );

  const mutationOptions = trpc.folders.delete.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries();
      navigate({ to: "/folders" });
    },
  });
  const deleteFolderMutation = useMutation(mutationOptions);

  // Loading state
  if (folderStatus === "pending") {
    return (
      <div className="flex-1 grid place-items-center">Loading folder...</div>
    );
  }

  // Error state
  if (folderStatus === "error") {
    return (
      <div className="flex-1 grid place-items-center text-destructive">
        Error: {folderError?.message}
      </div>
    );
  }

  if (!folder) {
    return (
      <div className="flex-1 grid place-items-center">Folder not found</div>
    );
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
          <Button variant="ghost" size="sm" className="text-destructive" onClick={() => deleteFolderMutation.mutate(folderId_num)}>
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
        {subFoldersStatus === "pending" ? (
          <div className="text-center py-4">Loading subfolders...</div>
        ) : !subFolders || subFolders.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No subfolders found.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subFolders.map(
              (subFolder: {
                id: number;
                title: string;
                description: string | null;
                visibility: string;
                parentId: number | null;
                createdAt: string;
                updatedAt: string;
              }) => (
                <Link
                  key={subFolder.id}
                  to="/folders/$folderId"
                  params={{ folderId: subFolder.id.toString() }}
                >
                  <div className="flex h-20 items-center gap-3 rounded-lg bg-primary/5 border-l-4 border-primary pl-3 pr-4 shadow-sm hover:bg-primary/10 transition-colors">
                    <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary/15">
                      <FolderClosed className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-lg">{subFolder.title}</h3>
                      <div className="text-sm text-muted-foreground">
                        {subFolder.description}
                      </div>
                    </div>
                  </div>
                </Link>
              )
            )}
          </div>
        )}
      </div>

      {/* Snippets in this folder */}
      <div>
        <h2 className="text-xl font-medium mb-4">Snippets in this folder</h2>
        {snippetsStatus === "pending" ? (
          <div className="text-center py-4">Loading snippets...</div>
        ) : !snippets || snippets.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No snippets found in this folder.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {snippets.map(
              (snippet: {
                id: number;
                title: string;
                content: string;
                language: string;
                createdAt: string;
                updatedAt: string;
              }) => (
                <Card
                  key={snippet.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <Link
                    to="/snippets/$snippetId"
                    params={{ snippetId: snippet.id.toString() }}
                    className="block h-full"
                  >
                    <CardHeader>
                      <CardTitle className="text-base">
                        {snippet.title}
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {snippet.language} • Updated{" "}
                        {new Date(snippet.updatedAt).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                  </Link>
                </Card>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
