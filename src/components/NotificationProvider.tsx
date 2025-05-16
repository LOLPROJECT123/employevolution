import { createContext, useContext, useState, useCallback } from "react";

type NotificationType = "success" | "error" | "info" | "warning";

interface Notification {
  id: number;
  message: string;
  type: NotificationType;
}

const NotificationContext = createContext({
  notify: (_msg: string, _type: NotificationType = "info") => {},
});

export const useNotification = () => useContext(NotificationContext);

// NotificationProvider: Provides toast/snackbar notifications for the app
export default function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const notify = useCallback((msg: string, type: NotificationType = "info") => {
    setNotifications((prev) => [
      ...prev,
      { id: Date.now() + Math.random(), message: msg, type },
    ]);
  }, []);

  function handleClose(id: number) {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
      <div className="fixed z-50 right-4 bottom-4 flex flex-col gap-2">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`rounded shadow-lg px-4 py-3 min-w-[240px] text-white ${
              n.type === "success"
                ? "bg-green-600"
                : n.type === "error"
                ? "bg-red-600"
                : n.type === "warning"
                ? "bg-yellow-600"
                : "bg-gray-800"
            }`}
            onClick={() => handleClose(n.id)}
            role="alert"
          >
            {n.message}
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}