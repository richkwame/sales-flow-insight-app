
import { BarChart3, Package, PlusCircle, TrendingUp, FileText, Receipt, Menu } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

interface AppSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const menuItems = [
  { id: "dashboard", title: "Dashboard", icon: BarChart3 },
  { id: "products", title: "Products", icon: Package },
  { id: "sales", title: "Sales Entry", icon: PlusCircle },
  { id: "expenses", title: "Expenses", icon: Receipt },
  { id: "analytics", title: "Analytics", icon: TrendingUp },
  { id: "summary", title: "Daily Summary", icon: FileText },
];

export function AppSidebar({ activeTab, setActiveTab }: AppSidebarProps) {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar className={isCollapsed ? "w-14" : "w-64"} collapsible="icon">
      <div className="p-4 border-b">
        <SidebarTrigger className="mb-2" />
        {!isCollapsed && (
          <h2 className="text-lg font-bold text-gray-800">Sales Tracker</h2>
        )}
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full justify-start ${
                      activeTab === item.id
                        ? "bg-blue-100 text-blue-700 font-medium"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {!isCollapsed && <span>{item.title}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
