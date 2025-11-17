import { Package, ShoppingBag, MapPin, Tag, LayoutGrid, Image, Palette, FolderTree } from "lucide-react";
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

interface AdminSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const menuItems = [
  { id: "products", title: "المنتجات", icon: ShoppingBag },
  { id: "categories", title: "الأقسام", icon: FolderTree },
  { id: "colors-sizes", title: "الألوان والمقاسات", icon: Palette },
  { id: "orders", title: "الطلبات", icon: LayoutGrid },
  { id: "offers", title: "العروض", icon: Tag },
  { id: "packages", title: "الباكدج", icon: Package },
  { id: "banners", title: "البانرات", icon: Image },
  { id: "governorates", title: "المحافظات", icon: MapPin },
];

export function AdminSidebar({ activeSection, onSectionChange }: AdminSidebarProps) {
  const { open: sidebarOpen } = useSidebar();

  return (
    <Sidebar className={sidebarOpen ? "w-64" : "w-16"}>
      <SidebarTrigger className="m-2 self-end" />
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className={!sidebarOpen ? "sr-only" : ""}>
            القائمة الرئيسية
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => onSectionChange(item.id)}
                    isActive={activeSection === item.id}
                    className="hover:bg-accent"
                  >
                    <item.icon className="h-5 w-5" />
                    {sidebarOpen && <span className="mr-2">{item.title}</span>}
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
