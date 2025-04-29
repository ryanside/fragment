import { useState } from "react";
import {
  Code,
  FolderClosed,
  Home,
  Settings,
  Star,
  Tag,
  Search,
  Bolt,
  FolderPlus,
  FilePlus,
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
import { useQuery } from "@tanstack/react-query";

export function AppSidebar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreateFolderDialogOpen, setIsCreateFolderDialogOpen] = useState(false);
  const location = useLocation();
  const { state } = useSidebar();
  const navigate = useNavigate();

  const { data: folders = [] } = useQuery(
    trpc.folders.getAll.queryOptions(undefined, {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      refetchOnReconnect: true,
    })
  );

  // Convert string dates to Date objects
  const foldersWithDateObjects = folders.map(folder => ({
    ...folder,
    createdAt: new Date(folder.createdAt),
    updatedAt: new Date(folder.updatedAt)
  }));

  const createSnippetOnSuccess = () => {
    setIsCreateDialogOpen(false);
    navigate({ to: "/snippets" });
  }

  const createFolderOnSuccess = () => {
    setIsCreateFolderDialogOpen(false);
    navigate({ to: "/folders" });
  }

  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarHeader>
        <SidebarMenuButton className="flex items-center text-white">
          <Bolt className="" />
          <span className="text-lg tracking-tight font-light">fragment</span>
        </SidebarMenuButton>
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
                    <CreateSnippetForm onSuccess={createSnippetOnSuccess} folders={foldersWithDateObjects ?? []} />
                  </DialogContent>
                </Dialog>
              </SidebarMenuItem>
              <SidebarMenuItem className="my-1.5">
                {state === "collapsed" ? (
                  <SidebarMenuButton className="w-full justify-center cursor-pointer">
                    <Search className="h-4 w-4" />
                  </SidebarMenuButton>
                ) : (
                  <SidebarInput
                    placeholder="Search snippets..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border-none"
                  />
                )}
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.pathname === "/dashboard"}>
                  <Link to="/dashboard">
                    <Home className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.pathname === "/snippets"}>
                  <Link to="/snippets">
                    <Code className="h-4 w-4" />
                    <span>All Snippets</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.pathname === "/starred"}>
                  <Link to="/starred">
                    <Star className="h-4 w-4" />
                    <span>Starred</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.pathname === "/tags"}>
                  <Link to="/dashboard">
                    <Tag className="h-4 w-4" />
                    <span>Tags</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
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
                <CreateFolderForm onSuccess={createFolderOnSuccess} folders={foldersWithDateObjects ?? []} />
              </DialogContent>
            </Dialog>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.pathname === "/folders"}>
                  <Link to="/folders">
                    <FolderClosed className="h-4 w-4" />
                    <span>All Folders</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {folders?.map((folder) => (
                <SidebarMenuItem key={folder.id}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === `/folders/${folder.id}`}
                  >
                    <Link to="/folders/$folderId" params={{ folderId: folder.id.toString() }}>
                      <FolderClosed className="h-4 w-4" />
                      <span>{folder.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={location.pathname === "/settings"}>
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
