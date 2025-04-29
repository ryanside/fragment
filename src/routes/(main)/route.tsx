import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { SiteHeader } from "@/components/site-header";
export const Route = createFileRoute("/(main)")({
  component: RouteLayout,
});

function RouteLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <Outlet />  
      </SidebarInset>
    </SidebarProvider>
  );
}
