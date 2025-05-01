import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useLocation } from "@tanstack/react-router";
import { User } from "better-auth/types";

export function SiteHeader({ user }: { user: User }) {
  const location = useLocation();

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-16">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block mt-0.5">
              {location.pathname === "/dashboard" ? (
                <div className="text-sm text-muted-foreground">
                  Welcome,{" "}
                  <span className="font-medium text-foreground">{user.name?.split(" ")[0]}</span>
                </div>
              ) : (
                <BreadcrumbLink href="#">{location.pathname}</BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {/* <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>{location.pathname}</BreadcrumbPage>
                </BreadcrumbItem> */}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
  );
}
