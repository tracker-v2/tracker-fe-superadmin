import { TdataDummyNotification } from './type';

export function formatNotificationDate(notificationDate: Date): string {
  const today = new Date();
  const diffTime = today.getTime() - notificationDate.getTime();
  const diffDays = diffTime / (1000 * 3600 * 24);
  const diffMonths = diffDays / 30;

  const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'long', year: 'numeric' };
  const formattedDate = notificationDate.toLocaleDateString('id-ID', options);

  if (diffMonths >= 1) {
    return formattedDate;
  } else {
    return `${Math.floor(diffDays)} hari yang lalu`;
  }
}

export function groupNotificationsByMonth(notifications: TdataDummyNotification[]): Record<string, TdataDummyNotification[]> {
  return notifications.reduce((groups, notification) => {
    const date = new Date(notification.time);
    const monthYear = `${date.toLocaleString('id-ID', { month: 'long' })} ${date.getFullYear()}`;
    if (!groups[monthYear]) {
      groups[monthYear] = [];
    }
    groups[monthYear].push(notification);
    return groups;
  }, {} as Record<string, TdataDummyNotification[]>);
}

export function getStatusStyle(status?: string) {
  switch (status) {
    case "OPERATING":
      return { text: "Beroperasi", bg: "bg-green-100", color: "text-green-800" };
    case "IDLE":
      return { text: "Idle", bg: "bg-yellow-100", color: "text-yellow-800" };
    case "STOPPED":
      return { text: "Mati", bg: "bg-red-100", color: "text-red-800" };
    default:
      return { text: "-", bg: "bg-gray-100", color: "text-gray-800" };
  }
}


// Helper function untuk mendapatkan icon path berdasarkan vehicle type dan status
export const getVehicleIconPath = (vehicleType?: string, status?: string): string => {
  if (!vehicleType || !status) return '/assets/icons/icon_car_default.webp';

  const type = vehicleType.toLowerCase().replace(/ /g, '-');
  let statusSuffix = 'default';

  // Map status ke suffix icon
  switch (status.toUpperCase()) {
    case 'OPERATING':
      statusSuffix = 'on';
      break;
    case 'STOPPED':
      statusSuffix = 'off';
      break;
    case 'IDLE':
      statusSuffix = 'idle';
      break;
    default:
      statusSuffix = 'default';
  }

  // Coba icon dengan status
  const iconPath = `/assets/icons/icon_${type}_${statusSuffix}.webp`;
  
  // Fallback ke default jika tidak ada
  return iconPath;
};