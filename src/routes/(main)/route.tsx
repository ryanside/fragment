import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SiteHeader } from "@/components/site-header";
import { authClient } from "@/lib/auth-client";
export const Route = createFileRoute("/(main)")({
  component: RouteLayout,
});

function RouteLayout() {
  const { data: session } = authClient.useSession();
  const navigate = useNavigate();

  const handleSignOut = () =>
    authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          navigate({ to: "/login" });
        },
      },
    });

  if (!session) {
    return <Outlet />;
  }

  return (
    <SidebarProvider>
      <AppSidebar handleSignOut={handleSignOut} />
      <SidebarInset>
        {session?.user && <SiteHeader user={session.user} />}
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}
