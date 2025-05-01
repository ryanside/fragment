import { createFileRoute, redirect } from "@tanstack/react-router";
import { queryClient, trpc } from "@/router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Folder, FolderPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CreateFolderForm } from "@/components/create-folder-form";
import { useNavigate } from "@tanstack/react-router";
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

export const Route = createFileRoute("/(main)/folders/")({
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
  const { data: session } = authClient.useSession();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const navigate = useNavigate();

  const {
    data: folders = [],
    status,
    error,
  } = useQuery(
    trpc.folders.getAll.queryOptions(session?.user.id ?? '', {
      staleTime: 8 * 1000,
      refetchOnMount: true,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    })
  );

  const handleCardClick = (folder: Folder) => {
    navigate({
      to: "/folders/$folderId",
      params: { folderId: folder.id.toString() },
    });
  };

  const handleCreateSuccess = () => {
    setIsDialogOpen(false);
    queryClient.invalidateQueries();
    navigate({ to: "/folders" });
  };

  // Convert string dates to Date objects
  const foldersWithDateObjects = folders.map((folder) => ({
    ...folder,
    createdAt: new Date(folder.createdAt),
    updatedAt: new Date(folder.updatedAt),
  }));

  if (status === "pending") {
    return <div className="flex-1 grid place-items-center">Loading...</div>;
  }

  if (status === "error") {
    return (
      <div className="flex-1 grid place-items-center text-destructive">
        Error: {error?.message}
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 pt-2">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl mb-6 pl-1">Folders</h1>
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
            <CreateFolderForm
              onSuccess={handleCreateSuccess}
              folders={foldersWithDateObjects ?? []}
            />
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
            <div
              key={folder.id}
              className="flex h-20 items-center gap-3 rounded-lg bg-primary/5 border-l-4 border-primary pl-3 pr-4 shadow-sm hover:bg-primary/10 transition-colors cursor-pointer"
              onClick={() => handleCardClick(folder)}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary/15">
                <Folder className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-lg">{folder.title}</h3>
                <div className="text-sm text-muted-foreground">
                  {folder.description}
                  {!folder.description && folder.parentId && (
                    <span>
                      Parent:{" "}
                      {folders.find((f) => f.id === folder.parentId)?.title}
                    </span>
                  )}
                  {!folder.description && !folder.parentId && (
                    <span>{folder.visibility}</span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
