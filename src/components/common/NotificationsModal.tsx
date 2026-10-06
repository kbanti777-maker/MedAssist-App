import React from 'react';
import { useApp } from '../../context/AppContext';
import { Bell, CheckCheck, X, AlertTriangle, Ambulance, UserCheck, Shield } from 'lucide-react';

export const NotificationsModal: React.FC = () => {
  const {
    isNotificationsOpen,
    setIsNotificationsOpen,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    setCurrentPage,
  } = useApp();

  if (!isNotificationsOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-4 bg-slate-950/40 backdrop-blur-xs">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden mt-16 mr-0 sm:mr-4 animate-in slide-in-from-top-4 duration-150">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-teal-600" />
            <h3 className="text-sm font-bold text-slate-900">Notifications</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={markAllNotificationsRead}
              className="text-xs text-teal-700 hover:text-teal-900 font-semibold flex items-center gap-1"
              title="Mark all as read"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark all read</span>
            </button>
            <button
              onClick={() => setIsNotificationsOpen(false)}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto divide-y divide-slate-100 p-1">
          {notifications.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              No recent notifications
            </div>
          ) : (
            notifications.map((notif) => {
              let Icon = Shield;
              let iconColor = 'text-slate-600 bg-slate-100';

              if (notif.type === 'emergency') {
                Icon = AlertTriangle;
                iconColor = 'text-rose-600 bg-rose-50';
              } else if (notif.type === 'ambulance') {
                Icon = Ambulance;
                iconColor = 'text-sky-600 bg-sky-50';
              } else if (notif.type === 'contact') {
                Icon = UserCheck;
                iconColor = 'text-teal-600 bg-teal-50';
              }

              return (
                <div
                  key={notif.id}
                  onClick={() => {
                    markNotificationRead(notif.id);
                    if (notif.type === 'emergency') setCurrentPage('sos');
                    if (notif.type === 'ambulance') setCurrentPage('ambulance');
                    if (notif.type === 'contact') setCurrentPage('contacts');
                    if (notif.type === 'profile') setCurrentPage('medical-card');
                    setIsNotificationsOpen(false);
                  }}
                  className={`p-3.5 rounded-2xl transition-colors cursor-pointer flex items-start gap-3 ${
                    notif.isRead ? 'hover:bg-slate-50 opacity-75' : 'bg-teal-50/40 hover:bg-teal-50/70'
                  }`}
                >
                  <div className={`p-2 rounded-xl shrink-0 ${iconColor}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-bold text-slate-900 leading-tight">
                        {notif.title}
                      </p>
                      <span className="text-[10px] text-slate-400 font-mono shrink-0">
                        {notif.timestamp}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5 leading-snug">
                      {notif.message}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
