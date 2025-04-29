import { createFileRoute, Link } from "@tanstack/react-router";
import { trpc } from "@/router";
import { useQuery } from "@tanstack/react-query";
import { File, Folder } from "lucide-react";

export const Route = createFileRoute("/(main)/dashboard")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: snippets = [], status: snippetsStatus } = useQuery(
    trpc.snippets.getAll.queryOptions(undefined, {
      staleTime: 5 * 1000,
    })
  );

  const { data: folders = [], status: foldersStatus } = useQuery(
    trpc.folders.getAll.queryOptions(undefined, {
      staleTime: 5 * 1000,
    })
  );

  return (
    <div className="flex flex-1 flex-col gap-8 p-4 pt-0">
      {/* Folders Section */}
      <section className="w-full">
        <h2 className="mb-4 text-xl font-semibold">Folders</h2>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
          {foldersStatus === "pending" ? (
            Array(3)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className="h-20 rounded-lg bg-muted/50 animate-pulse"
                />
              ))
          ) : folders.length === 0 ? (
            <div className="col-span-full py-6 text-center text-muted-foreground">
              No folders yet. Create your first folder to organize your
              snippets.
            </div>
          ) : (
            folders.map((folder) => (
              <Link key={folder.id} to="/folders/$folderId" params={{ folderId: folder.id.toString() }}>
                <div
                  className="flex h-20 items-center gap-3 rounded-lg bg-primary/5 border-l-4 border-primary pl-3 pr-4 shadow-sm hover:bg-primary/10 transition-colors"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary/15">
                    <Folder className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-lg">{folder.title}</h3>
                    <div className="text-sm text-muted-foreground">
                      {folder.description}
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>

      {/* Snippets Section */}
      <section className="w-full">
        <h2 className="mb-4 text-xl font-semibold">Snippets</h2>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {snippetsStatus === "pending" ? (
            Array(3)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className="h-36 rounded-lg bg-muted/50 animate-pulse"
                />
              ))
          ) : snippets.length === 0 ? (
            <div className="col-span-full py-6 text-center text-muted-foreground">
              No snippets yet. Create your first snippet to get started.
            </div>
          ) : (
            snippets.slice(0, 6).map((snippet) => (
              <Link key={snippet.id} to="/snippets/$snippetId" params={{ snippetId: snippet.id.toString() }}>
                <div
                  className="flex h-36 flex-col rounded-lg bg-card overflow-hidden border border-border shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="bg-secondary/30 h-1.5"></div>
                  <div className="flex-1 flex flex-col justify-between p-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <File className="h-6 w-6 text-muted-foreground" />
                        <h3 className="font-medium truncate">{snippet.title}</h3>
                      </div>
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {snippet.description || "No description"}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {new Date(snippet.createdAt).toLocaleDateString()}
                      </span>
                      <span className="rounded-full bg-secondary/20 px-2 py-0.5 text-xs text-secondary-foreground">
                        {snippet.visibility}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>

      {/* Recent Activity Section */}
      <section className="w-full">
        <h2 className="mb-4 text-xl font-semibold">Recent Activity</h2>
        <div className="rounded-lg border border-border bg-background p-1">
          <div className="divide-y divide-border">
            {snippetsStatus === "pending" ? (
              Array(3)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="flex gap-3 p-3">
                    <div className="h-10 w-10 rounded-full bg-muted/50 animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-3/4 rounded bg-muted/50 animate-pulse" />
                      <div className="h-3 w-1/2 rounded bg-muted/50 animate-pulse" />
                    </div>
                  </div>
                ))
            ) : snippets.length === 0 ? (
              <div className="py-6 text-center text-muted-foreground">
                No recent activity. Start creating and editing snippets!
              </div>
            ) : (
              snippets.slice(0, 5).map((snippet, index) => (
                <Link key={snippet.id} to="/snippets/$snippetId" params={{ snippetId: snippet.id.toString() }}>
                  <div className="flex items-start gap-3 rounded-md p-3 hover:bg-muted/30 transition-colors">
                    <div className="relative">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/20">
                        <File className="h-6 w-6 text-muted-foreground" />
                      </div>
                      {index < snippets.slice(0, 5).length - 1 && (
                        <div className="absolute left-1/2 top-full h-full w-0.5 -translate-x-1/2 bg-border" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{snippet.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {snippet.updatedAt ? "Updated" : "Created"}{" "}
                        {new Date(
                          snippet.updatedAt || snippet.createdAt
                        ).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">
                      {new Date(
                        snippet.updatedAt || snippet.createdAt
                      ).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
