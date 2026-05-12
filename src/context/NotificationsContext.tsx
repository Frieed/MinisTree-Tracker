import React, { createContext, useContext, type ReactNode } from 'react';
import { useNotificationsData, type Notification } from '../hooks/useNotifications';

interface NotificationsContextType {
    notifications: Notification[];
    loading: boolean;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    deleteNotification: (id: string) => Promise<void>;
    createNotification: (title: string, message: string, type: 'info' | 'warning' | 'success') => Promise<void>;
    checkAndGenerateNotifications: (visits: any[], stageIdx: number) => Promise<void>;
    refresh: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const NotificationsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const notificationsData = useNotificationsData();

    return (
        <NotificationsContext.Provider value={notificationsData}>
            {children}
        </NotificationsContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationsContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationsProvider');
    }
    return context;
};
