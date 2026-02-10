
import React, { useState, useEffect } from "react";
import { Bell } from "lucide-react";

export default function NotificationBell({ doctorId }) {
    const [notifications, setNotifications] = useState([]);
    const [show, setShow] = useState(false);

    useEffect(() => {
        // Poll for notifications every 10 seconds
        const fetchNotes = () => {
            if (!doctorId) return;
            fetch(`/api/notifications/${doctorId}`)
                .then(res => res.json())
                .then(setNotifications)
                .catch(console.error);
        };
        fetchNotes();
        const interval = setInterval(fetchNotes, 10000);
        return () => clearInterval(interval);
    }, [doctorId]);

    const markAsRead = (id) => {
        fetch(`/api/notifications/${id}/read`, { method: 'PUT' })
            .then(() => {
                setNotifications(notes => notes.map(n => n.id === id ? { ...n, is_read: 1 } : n));
            });
    };

    const unreadCount = notifications.filter(n => !n.is_read).length;

    return (
        <div className="relative">
            <button
                onClick={() => setShow(!show)}
                className="relative p-2 rounded-xl hover:bg-gray-100 transition"
            >
                <Bell className="w-6 h-6 text-gray-600" />
                {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse border-2 border-white" />
                )}
            </button>

            {show && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                    <div className="p-4 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
                        <h4 className="font-bold text-gray-900 text-sm">Notifications</h4>
                        {unreadCount > 0 && <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{unreadCount} New</span>}
                    </div>
                    <div className="max-h-80 overflow-y-auto custom-scrollbar">
                        {notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <Bell className="w-8 h-8 text-gray-200 mb-2" />
                                <p className="text-gray-400 text-xs font-medium">No notifications yet.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-50">
                                {notifications.map(n => (
                                    <div
                                        key={n.id}
                                        className={`p-4 hover:bg-gray-50 transition ${!n.is_read ? 'bg-emerald-50/30' : ''}`}
                                        onClick={() => !n.is_read && markAsRead(n.id)}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={`mt-1 min-w-[8px] h-2 rounded-full ${!n.is_read ? 'bg-emerald-500' : 'bg-gray-200'}`} />
                                            <div>
                                                <p className="text-sm text-gray-700 leading-snug">{n.message}</p>
                                                <span className="text-[10px] text-gray-400 font-medium mt-1.5 block">
                                                    {new Date(n.created_at).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
