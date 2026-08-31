import React from "react";

const NotificationOverlay = ({ notifications }) => {
  return (
    <div className="fixed top-6 right-6 z-50 space-y-2 pointer-events-none">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`
            px-4 py-2 rounded text-white text-sm font-semibold
            pointer-events-auto
            animate-slideIn
            ${
              notification.type === "success"
                ? "bg-green-500"
                : notification.type === "warning"
                  ? "bg-yellow-500"
                  : notification.type === "levelup"
                    ? "bg-purple-500"
                    : "bg-blue-500"
            }
          `}
        >
          {notification.type === "levelup" ? (
            <div className="text-center">
              <div className="font-bold text-base">{notification.title}</div>
              <div className="text-xs opacity-90">{notification.message}</div>
            </div>
          ) : (
            <div>{notification.message}</div>
          )}
        </div>
      ))}

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(400px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default NotificationOverlay;
