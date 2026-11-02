import React from "react";
import NotificationsDropdown, { StudentNotification } from "./NotificationsDropdown";
import { useNotifications } from "../context/NotificationContext";

export type { StudentNotification };

interface NotificationDropdownProps {
  isOpen?: boolean;
  onClose?: () => void;
  notifications?: StudentNotification[];
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
  onDeleteOne?: (id: string) => void;
  onClearAll?: () => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  isOpen = true,
  onClose = () => {},
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteOne,
  onClearAll,
}) => {
  const ctx = useNotifications();

  return (
    <NotificationsDropdown
      isOpen={isOpen}
      onClose={onClose}
      notifications={notifications ?? ctx.notifications}
      onMarkAsRead={onMarkAsRead ?? ctx.markAsRead}
      onMarkAllAsRead={onMarkAllAsRead ?? ctx.markAllAsRead}
      onDeleteOne={onDeleteOne ?? ctx.deleteNotification}
      onClearAll={onClearAll ?? ctx.clearAll}
    />
  );
};

export default NotificationDropdown;
