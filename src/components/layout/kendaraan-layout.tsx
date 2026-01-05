import { LeftSidebar } from "../leftbar";
import { SidebarRight } from "../rightbar";
import { SidebarProvider } from "../ui/sidebar";

export const KendaraanLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className='flex h-screen w-screen overflow-hidden'>
      {/* Provider terpisah untuk sidebar kiri */}
      <SidebarProvider
        style={
          {
            "--sidebar-width": "260px",
            "--sidebar-width-icon": "92px",
          } as React.CSSProperties
        }
        className='w-fit'
      >
        <LeftSidebar />
      </SidebarProvider>

      {/* Main content area */}
      <main className=' flex-1 overflow-auto'>{children}</main>

      {/* Provider terpisah untuk sidebar kanan dengan width lebih kecil */}
      <SidebarProvider
        style={
          {
            "--sidebar-width": "300px",
            "--sidebar-width-icon": "72px",
          } as React.CSSProperties
        }
        className='w-fit'
      >
        <SidebarProvider
          style={
            {
              "--sidebar-width": "300px",
              "--sidebar-width-icon": "72px",
            } as React.CSSProperties
          }
          className='w-fit'
        >
          <SidebarRight />
        </SidebarProvider>
      </SidebarProvider>
    </div>
  );
};
