import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, AppWindow, Zap, Shield, GitBranch, ScrollText, LogOut, KeyRound, Inbox } from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";
import { Logo } from "@/components/Logo";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const items = [
  { title: "Overview", url: "/app", icon: LayoutDashboard, end: true },
  { title: "Connected apps", url: "/app/apps", icon: AppWindow },
  { title: "Actions", url: "/app/actions", icon: Zap },
  { title: "Permissions", url: "/app/permissions", icon: Shield },
  { title: "Approval rules", url: "/app/approvals", icon: GitBranch },
  { title: "Pending approvals", url: "/app/pending", icon: Inbox },
  { title: "Agent tokens", url: "/app/tokens", icon: KeyRound },
  { title: "Audit logs", url: "/app/logs", icon: ScrollText },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const isActive = (url: string, end?: boolean) => end ? pathname === url : pathname.startsWith(url);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border h-16 flex items-center justify-center">
        {collapsed ? (
          <span className="h-8 w-8 rounded-lg bg-gradient-hero shadow-glow" />
        ) : (
          <Logo />
        )}
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map(item => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url, item.end)}>
                    <NavLink to={item.url} end={item.end} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-2">
        {!collapsed && user && (
          <div className="px-2 py-1.5 text-xs text-muted-foreground truncate">{user.email}</div>
        )}
        <Button variant="ghost" size="sm" onClick={signOut} className="justify-start gap-2">
          <LogOut className="h-4 w-4" />
          {!collapsed && <span>Sign out</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
