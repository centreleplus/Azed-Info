import { useNotifications as useNotificationContextHook, NotificationProvider, toStudentNotification } from "../context/NotificationContext";
import { StudentNotification, Notification } from "../types";

export { NotificationProvider, toStudentNotification };
export type { StudentNotification, Notification };

export function useNotifications(userRole?: string, userId?: string, studyGroup?: string) {
  try {
    const context = useNotificationContextHook();
    if (context) {
      return {
        ...context,
        deleteNotification: context.deleteNotification,
        markAllAsRead: context.markAllAsRead,
        deleteOne: context.deleteOne,
        markAllRead: context.markAllRead
      };
    }
  } catch (e) {
    // If called outside NotificationProvider fallback
  }

  // Fallback return if outside provider
  return {
    notifications: [] as StudentNotification[],
    unreadCount: 0,
    loading: false,
    markAllRead: async () => {},
    markAllAsRead: () => {},
    markAsRead: () => {},
    deleteOne: async () => {},
    deleteNotification: () => {},
    clearAll: () => {},
    addNotification: () => {},
    notifyFileAdded: () => {},
    notifyQuizAdded: () => {},
    notifyCalendarEventAdded: () => {},
    notifyShopProductAdded: () => {},
    notifyCartAdded: () => {},
    notifyWishlistAdded: () => {},
    notifyOrderConfirmed: () => {},
    refreshNotifications: async () => {}
  };
}

export default useNotifications;
