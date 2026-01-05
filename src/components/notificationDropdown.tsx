import { Bell, CircleArrowRight, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TtypeNotification } from "@/lib/type";
import { dataDummyNotification } from "@/lib/constant";
import { Link } from "react-router-dom";
import { formatNotificationDate } from "@/lib/helper";

const typeNotification = ["Semua", "Service", "Geofance"];

export function NotificationDropdown() {
  const { isMobile } = useSidebar();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<TtypeNotification>("Semua");

  // Local state to track notifications
  const [notifications, setNotifications] = useState(dataDummyNotification);

  // Filter notifications by type
  const filteredType = notifications.filter((item) => {
    if (type === "Semua") return true;
    return item.type === type;
  });

  // Remove notification when clicked
  const removeNotification = (index: number) => {
    setNotifications((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu open={open} onOpenChange={setOpen}>
          {/* TRIGGER BUTTON */}
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent mx-auto data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Bell size={24} />
                  <div className="w-2 h-2 p-[7px] items-center flex justify-center -top-0.5 -right-0.5 bg-red-500 absolute rounded-full">
                    <p className="text-white text-[8px]">99+</p>
                  </div>
                </div>
                <h1 className="font-medium text-xl text-left">Notifikasi</h1>
              </div>
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          {/* DROPDOWN CONTENT */}
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-[360px] h-[540px] rounded-lg p-4 flex flex-col gap-3"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={10}
          >
            {/* HEADER */}
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-2 py-1.5 text-left text-sm border-b">
                <Bell size={20} />
                <h1 className="font-medium text-lg">Notifikasi</h1>
                <button
                  className="ml-auto w-10 h-10 p-3 hover:bg-accent rounded-lg"
                  onClick={() => setOpen(false)}
                >
                  <X size={16} />
                </button>
              </div>
            </DropdownMenuLabel>

            {/* FILTER TABS */}
            <DropdownMenuGroup className="h-10 flex p-1 bg-secondary rounded-md">
              {typeNotification.map((item, index) => (
                <Button
                  key={index}
                  className={`w-[126px] text-primary-foreground rounded-md h-8 ${
                    type === item
                      ? "bg-blue-900 hover:bg-blue-900"
                      : "bg-transparent hover:bg-transparent text-muted-foreground"
                  }`}
                  onClick={() => setType(item as TtypeNotification)}
                >
                  <p className="mx-auto">{item}</p>
                </Button>
              ))}
            </DropdownMenuGroup>

            {/* NOTIFICATION LIST */}
            <DropdownMenuGroup className="max-h-[432px] grid gap-2 overflow-y-auto pb-5 rounded-md">
              {filteredType.map((item, index) => (
                <DropdownMenuItem
                  key={index}
                  onSelect={(e) => {
                    e.preventDefault(); // prevent dropdown from closing
                    removeNotification(index);
                  }}
                  className="h-[158px] rounded-md shadow-md cursor-pointer bg-blue-100"
                >
                  <div className="flex flex-col gap-2 p-3">
                    <h1
                      className={`${
                        item.type === "Geofance" ? "bg-red-600" : "bg-blue-600"
                      } text-primary-foreground px-2.5 w-fit rounded-full h-5`}
                    >
                      {item.type}
                    </h1>
                    <h2 className="text-sm font-semibold leading-6 text-stone-950">
                      {item.title}
                    </h2>
                    <p className="text-xs leading-6">{item.description}</p>
                    <p className="text-xs text-stone-400 ml-auto">
                      {formatNotificationDate(new Date(item.time))}
                    </p>
                  </div>
                </DropdownMenuItem>
              ))}

              {filteredType.length === 0 && (
                <div className="text-center text-sm text-muted-foreground py-10">
                  Tidak ada notifikasi.
                </div>
              )}
            </DropdownMenuGroup>

            {/* SEE ALL */}
            <DropdownMenuItem className="w-full hover:bg-sidebar-accent max-h-10 px-3 py-2 mt-auto">
              <Link
                to="/notifikasi"
                className="w-full flex items-center justify-end rounded-md gap-2"
              >
                <CircleArrowRight size={16} color="#1E3A8A" />
                <p className="text-sm leading-6 text-blue-900">LIHAT SEMUA</p>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}


// import { Bell } from "lucide-react";
// import {
//   Tooltip,
//   TooltipContent,
//   TooltipProvider,
//   TooltipTrigger,
// } from "@/components/ui/tooltip";
// import {
//   SidebarMenu,
//   SidebarMenuButton,
//   SidebarMenuItem,
// } from "@/components/ui/sidebar";

// export function NotificationDropdown() {
//   return (
//     <SidebarMenu>
//       <SidebarMenuItem>
//         <TooltipProvider>
//           <Tooltip>
//             <TooltipTrigger asChild>
//               <SidebarMenuButton
//                 size="lg"
//                 onClick={(e) => {
//                   e.preventDefault(); // Tidak menjalankan dropdown
//                 }}
//                 className="mx-auto hover:bg-sidebar-accent/70 text-muted-foreground cursor-default"
//               >
//                 <div className="flex items-center gap-2">
//                   <div className="relative">
//                     <Bell size={24} className="hover:text-gray-200 text-gray-200" />
//                     <div className="w-2 h-2 p-[7px] items-center flex justify-center -top-0.5 -right-0.5 bg-red-200 absolute rounded-full">
//                       <p className="text-white text-[8px]">99+</p>
//                     </div>
//                   </div>
//                   <h1 className="font-medium text-xl text-gray-400 hover:text-gray-200 text-left">Notifikasi</h1>
//                 </div>
//               </SidebarMenuButton>
//             </TooltipTrigger>
//             <TooltipContent side="top" sideOffset={6}>
//               next update
//             </TooltipContent>
//           </Tooltip>
//         </TooltipProvider>
//       </SidebarMenuItem>
//     </SidebarMenu>
//   );
// }
