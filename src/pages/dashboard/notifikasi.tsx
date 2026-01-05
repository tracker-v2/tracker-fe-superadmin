import { Button } from "@/components/ui/button";
import { dataDummyNotification } from "@/lib/constant";
import {
  formatNotificationDate,
  groupNotificationsByMonth,
} from "@/lib/helper";
import { TdataDummyNotification } from "@/lib/type";
import { useState } from "react";

const typeNotification = ["Semua", "Service", "Geofance"];

function Notifikasi() {
  const [type, setType] = useState("Semua");
  const [notifications, setNotifications] = useState(dataDummyNotification);

  const filteredNotifications =
    type === "Semua"
      ? notifications
      : notifications.filter((notification) => notification.type === type);

  const groupedNotifications: Record<string, TdataDummyNotification[]> =
    groupNotificationsByMonth(filteredNotifications);

  const handleNotificationClick = (id: number) => {
    setNotifications((prevNotifications) =>
      prevNotifications.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  return (
    <div className="p-6 mb-5 bg-white mx-4 rounded-lg max-w-[1552px] w-screen min-h-[1048px]">
      {/* TYPE */}
      <div className="h-10 flex p-1 bg-secondary rounded-md w-[388px]">
        {typeNotification.map((item, index) => (
          <Button
            key={index}
            className={`w-[126px] text-primary-foreground rounded-md h-8 ${
              type === item
                ? "bg-blue-900 hover:bg-blue-900"
                : "bg-transparent hover:bg-transparent text-muted-foreground"
            }`}
            onClick={() => setType(item)}
          >
            <p className="mx-auto">{item}</p>
          </Button>
        ))}
      </div>

      {/* CONTENT NOTIFICATION */}
      <div className="mt-8 space-y-2">
        {Object.entries(groupedNotifications).map(
          ([monthYear, notifications], index) => (
            <div key={index}>
              <h3 className="text-lg font-semibold text-stone-400 mb-2 mt-4">
                {monthYear}
              </h3>
              {notifications.map((item) => (
                <div
                  key={item.id}
                  className={`h-[134px] rounded-md shadow-md mb-2 cursor-pointer ${
                    item.read ? "bg-blue-100" : "bg-gray-50"
                  }`}
                  onClick={() => handleNotificationClick(item.id)}
                >
                  <div className="flex flex-col gap-2 p-3">
                    <h1
                      className={`${
                        item.type === "Geofance" ? "bg-red-600" : "bg-blue-600"
                      } text-primary-foreground px-2.5 w-fit rounded-full h-5 flex items-center justify-center`}
                    >
                      {item.type}
                    </h1>
                    <h2 className="text-base font-semibold leading-6 text-stone-950">
                      {item.title}
                    </h2>
                    <p className="text-sm leading-6">{item.description}</p>
                    <p className="text-xs text-stone-400 ml-auto">
                      {formatNotificationDate(new Date(item.time))}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default Notifikasi;
