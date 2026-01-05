import * as React from "react";
import matador from "../assets/matador.png";
import iconmatador from "../assets/matador-logo.png";
import { LayoutDashboard, Wrench, FileText, Car } from "lucide-react";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "./nav-user";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail, useSidebar } from "@/components/ui/sidebar";
import { NotificationDropdown } from "./notificationDropdown";
import { Separator } from "./ui/separator";
import { useAuthStore } from "@/store/useAuthStore";

// This is sample data.
const data = {
  user: {
    name: "Jamet Kudasi",
    email: "m@example.com",
    avatar: "https://github.com/shadcn.png",
  },
  notification: {
    name: "Notification",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
      isActive: true,
    },
    {
      title: "Kendaraan",
      url: "/kendaraan",
      icon: Car,
    },
    {
      title: "Laporan",
      url: "/laporan",
      icon: FileText,
    },
    {
      title: "Perawatan Kendaraan",
      url: "/vehicle-maintenances",
      icon: Wrench,
    },
  ],
};

// Custom header component that changes logo based on sidebar state
const DynamicHeader = () => {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <SidebarHeader className='flex justify-center items-center'>
      <img src={isCollapsed ? iconmatador : matador} alt='logo tracker' className={isCollapsed ? "w-[32px]" : "w-[192px]"} />
    </SidebarHeader>
  );
};

export function LeftSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = useAuthStore((s) => s.user);
  // console.log("user", user);
  return (
    <Sidebar side='left' collapsible='icon' {...props}>
      <DynamicHeader />
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter className='px-5 '>
        <Separator className='mb-6' />
        <NotificationDropdown />
      </SidebarFooter>
      <SidebarFooter className='p-5'>
        <NavUser
          user={{
            name: user?.username || "Guest",
            email: user?.email || "-",
            avatar: "https://github.com/shadcn.png",
          }}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
