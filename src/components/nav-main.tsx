import { type LucideIcon } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { SidebarGroup, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
    disabled?: boolean;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
}) {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // Fungsi untuk menangani navigasi
  const handleNavigation = (url: string) => {
    if (url && url !== "#") {
      navigate(url);
    }
  };

  return (
    <SidebarGroup className='mt-5'>
      <SidebarMenu className={isCollapsed ? "items-center" : ""}>
        {items.map((item, index) => (
          <Collapsible key={item.title} asChild defaultOpen={item.isActive} className={`group/collapsible ${index > 0 ? "mt-2" : ""}`}>
            <SidebarMenuItem>
              <CollapsibleTrigger asChild className='gap-2 p-5 items-center'>
                {item.disabled ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <SidebarMenuButton tooltip={item.title} className={`${isCollapsed ? "items-center" : ""} hover:text-gray-200 cursor-default text-gray-300 m-2 ${(pathname === item.url || pathname.startsWith(item.url)) ? "bg-blue-900 text-primary-foreground  " : ""}`} onClick={(e) => e.preventDefault()}>
                        {item.icon && <item.icon size={20} />}
                        <span className='text-lg hover:text-gray-200 font-medium'>{item.title}</span>
                      </SidebarMenuButton>
                    </TooltipTrigger>
                    <TooltipContent side='bottom' sideOffset={6}>
                      next update
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <SidebarMenuButton tooltip={item.title} className={`${isCollapsed ? "items-center" : ""} cursor-pointer  ${(pathname === item.url || pathname.startsWith(item.url)) ? "bg-blue-900 text-primary-foreground" : ""}`} onClick={() => handleNavigation(item.url)}>
                    {item.icon && <item.icon size={16} />} {/* perkecil icon */}
                    <span className='text-sm font-medium'>{item.title}</span> {/* perkecil font */}
                  </SidebarMenuButton>
                )}
              </CollapsibleTrigger>
              {/* SUB ITEMS */}
              <CollapsibleContent>
                {item.items && item.items.length > 0 && (
                  <div className='pl-8 mt-1 space-y-1'>
                    {item.items.map((subItem) => (
                      <div key={subItem.title} className='px-2 py-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer' onClick={() => handleNavigation(subItem.url)}>
                        {subItem.title}
                      </div>
                    ))}
                  </div>
                )}
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
