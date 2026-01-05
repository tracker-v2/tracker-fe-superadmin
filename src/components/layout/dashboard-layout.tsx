import { SidebarProvider } from "@/components/ui/sidebar";
import { LeftSidebar } from "../leftbar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex w-full h-full ">
        <LeftSidebar />
        <div className="flex-1 overflow-hidden relative">
          {/* <SidebarTrigger /> */}
          <main className="w-full h-full px-4 py-4  ">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
