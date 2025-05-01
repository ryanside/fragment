import { useState } from "react";
import {
  Code,
  FolderClosed,
  Home,
  Settings,
  Star,
  Search,
  Bolt,
  FolderPlus,
  FilePlus,
  LogOut,
  FolderKanban,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Link, useLocation } from "@tanstack/react-router";
import { Button } from "./ui/button";
import { CreateSnippetForm } from "./create-snippet-form";
import { CreateFolderForm } from "./create-folder-form";
import { useNavigate } from "@tanstack/react-router";
import { trpc } from "@/router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "./ui/skeleton";
import { authClient } from "@/lib/auth-client";

export function AppSidebar({ handleSignOut }: { handleSignOut: () => void }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreateFolderDialogOpen, setIsCreateFolderDialogOpen] =
    useState(false);
  const location = useLocation();
  const { state } = useSidebar();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: session } = authClient.useSession();
  const { data: folders = [], status: foldersStatus } = useQuery(
    trpc.folders.getAll.queryOptions(session?.user.id ?? "", {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      refetchOnReconnect: true,
    })
  );

  // Convert string dates to Date objects
  const foldersWithDateObjects = folders.map((folder) => ({
    ...folder,
    createdAt: new Date(folder.createdAt),
    updatedAt: new Date(folder.updatedAt),
  }));

  const createSnippetOnSuccess = () => {
    setIsCreateDialogOpen(false);
    navigate({ to: "/snippets" });
  };

  const createFolderOnSuccess = () => {
    setIsCreateFolderDialogOpen(false);
    queryClient.invalidateQueries();
    navigate({ to: "/folders" });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate({ to: "/search", search: { q: searchQuery } });
    }
  };

  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarHeader>
        <Link to="/dashboard">
          <SidebarMenuButton className="flex items-center text-white">
            <Bolt className="" />
            <span className="text-lg tracking-tight font-light">fragment</span>
          </SidebarMenuButton>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="py-0">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem className="">
                <Dialog
                  open={isCreateDialogOpen}
                  onOpenChange={setIsCreateDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      className="w-full cursor-pointer"
                      variant="default"
                      aria-label="Create New Snippet"
                      size={state === "collapsed" ? "sm" : "default"}
                    >
                      <FilePlus
                        className={state === "collapsed" ? "h-4 w-4" : "hidden"}
                      />
                      {state !== "collapsed" && "New Snippet"}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Snippet</DialogTitle>
                    </DialogHeader>
                    <CreateSnippetForm
                      onSuccess={createSnippetOnSuccess}
                      folders={foldersWithDateObjects ?? []}
                    />
                  </DialogContent>
                </Dialog>
              </SidebarMenuItem>
              <SidebarMenuItem className="my-1.5">
                {state === "collapsed" ? (
                  <SidebarMenuButton
                    className="w-full justify-center cursor-pointer"
                    onClick={() => navigate({ to: "/search" })}
                  >
                    <Search className="h-4 w-4" />
                  </SidebarMenuButton>
                ) : (
                  <form onSubmit={handleSearch}>
                    <SidebarInput
                      placeholder="Search fragment..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="border-none"
                    />
                  </form>
                )}
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname === "/dashboard"}
                >
                  <Link to="/dashboard">
                    <Home className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname === "/snippets"}
                >
                  <Link to="/snippets">
                    <Code className="h-4 w-4" />
                    <span>All Snippets</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname === "/starred"}
                >
                  <Link to="/starred">
                    <Star className="h-4 w-4" />
                    <span>Starred</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {/* <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname === "/tags"}
                >
                  <Link to="/dashboard">
                    <Tag className="h-4 w-4" />
                    <span>Tags</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem> */}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <div className="border-t border-dashed mx-2" />
        <SidebarGroup className="pt-1">
          <SidebarGroupLabel className="flex justify-between items-center pr-2">
            <span>Folders</span>
            <Dialog
              open={isCreateFolderDialogOpen}
              onOpenChange={setIsCreateFolderDialogOpen}
            >
              <DialogTrigger asChild>
                <Button
                  className="h-6 w-6 p-0 rounded-md"
                  variant="ghost"
                  size="sm"
                >
                  <FolderPlus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Folder</DialogTitle>
                </DialogHeader>
                <CreateFolderForm
                  onSuccess={createFolderOnSuccess}
                  folders={foldersWithDateObjects ?? []}
                />
              </DialogContent>
            </Dialog>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname === "/folders"}
                >
                  <Link to="/folders">
                    <FolderKanban className="h-4 w-4" />
                    <span>All Folders</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {foldersStatus === "pending" ? (
                <Skeleton className="h-6 w-1/2"></Skeleton>
              ) : (
                folders?.map((folder) => (
                  <SidebarMenuItem key={folder.id}>
                    <SidebarMenuButton
                      asChild
                      isActive={location.pathname === `/folders/${folder.id}`}
                    >
                      <Link
                        to="/folders/$folderId"
                        params={{ folderId: folder.id.toString() }}
                      >
                        <FolderClosed className="h-4 w-4" />
                        <span>{folder.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4" />
              {state !== "collapsed" && "Sign out"}
            </Button>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={location.pathname === "/settings"}
            >
              <Link to="/dashboard">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
