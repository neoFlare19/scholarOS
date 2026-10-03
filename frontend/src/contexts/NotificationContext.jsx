import { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  getNotifications,
  getNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification as apiDeleteNotification,
} from "../services/dashboardService.js";

const NotificationContext = createContext();

function formatTimeAgo(isoString) {
  if (!isoString) return "";
  const date = new Date(isoString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "1d ago";
  if (days < 30) return `${days}d ago`;
  return date.toLocaleDateString();
}

function getNotificationGroup(isoString) {
  if (!isoString) return "Today";
  const date = new Date(isoString);
  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isToday) return "Today";

  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  if (isYesterday) return "Yesterday";
  return "Older";
}

function normalizeNotification(n) {
  const isRead = Boolean(n.is_read || n.read_at);
  const createdAt = n.created_at || new Date().toISOString();
  const group = getNotificationGroup(createdAt);
  const time = formatTimeAgo(createdAt);

  // Map category based on type or entity
  let category = "Tasks";
  const typeLower = (n.type || "").toLowerCase();
  if (typeLower.includes("task") || typeLower.includes("project")) {
    category = "Tasks";
  } else if (typeLower.includes("paper") || typeLower.includes("submission")) {
    category = "Papers";
  } else if (typeLower.includes("mention") || typeLower.includes("comment")) {
    category = "Mentions";
  } else {
    category = "Tasks";
  }

  const initials = n.sender?.full_name
    ? n.sender.full_name
        .split(" ")
        .map((s) => s[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "SO";

  let iconType = "info";
  if (typeLower.includes("completed") || typeLower.includes("approved")) {
    iconType = "success";
  } else if (typeLower.includes("rejected") || typeLower.includes("deadline")) {
    iconType = "warning";
  } else if (n.sender?.full_name) {
    iconType = initials;
  }

  return {
    id: n.id,
    group,
    category,
    title:
      n.title ||
      (n.type
        ? n.type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
        : "Notification"),
    description: n.message || n.description || "",
    time,
    tag: n.link ? n.link.split("/").filter(Boolean).pop() : undefined,
    icon: iconType,
    unread: !isRead,
    is_read: isRead,
    priority:
      n.priority ||
      (n.message &&
      (n.message.toLowerCase().includes("deadline") ||
        n.message.toLowerCase().includes("urgent"))
        ? "High"
        : "Medium"),
    sender: n.sender?.full_name || "ScholarOS System",
    link: n.link || null,
    created_at: createdAt,
  };
}

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("scholaros_token");
      if (!token) {
        setNotifications([]);
        setUnreadCount(0);
        return;
      }

      const [listRes, countRes] = await Promise.allSettled([
        getNotifications(),
        getNotificationCount(),
      ]);

      if (listRes.status === "fulfilled" && listRes.value?.data) {
        const rawItems = Array.isArray(listRes.value.data)
          ? listRes.value.data
          : listRes.value.data?.data || [];
        setNotifications(rawItems.map(normalizeNotification));
      }

      if (countRes.status === "fulfilled" && countRes.value?.data) {
        setUnreadCount(countRes.value.data.unread ?? 0);
      } else if (listRes.status === "fulfilled" && listRes.value?.data) {
        const rawItems = Array.isArray(listRes.value.data)
          ? listRes.value.data
          : listRes.value.data?.data || [];
        setUnreadCount(rawItems.filter((item) => !item.is_read).length);
      }
    } catch (err) {
      console.error("Failed to load notifications:", err);
      setError(err?.data?.message || err?.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (id) => {
    try {
      // Optimistic update
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, unread: false, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      await markNotificationAsRead(id);
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
      // Re-fetch to sync if needed
      fetchNotifications();
    }
  };

  const markAllAsRead = async () => {
    try {
      // Optimistic update
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, unread: false, is_read: true }))
      );
      setUnreadCount(0);

      await markAllNotificationsAsRead();
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
      fetchNotifications();
    }
  };

  const deleteNotification = async (id) => {
    try {
      const target = notifications.find((n) => n.id === id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      if (target?.unread) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }

      await apiDeleteNotification(id);
    } catch (err) {
      console.error("Failed to delete notification:", err);
      fetchNotifications();
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        error,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        refetch: fetchNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    return {
      notifications: [],
      unreadCount: 0,
      loading: false,
      error: null,
      markAsRead: () => {},
      markAllAsRead: () => {},
      deleteNotification: () => {},
      refetch: () => {},
    };
  }
  return context;
};
