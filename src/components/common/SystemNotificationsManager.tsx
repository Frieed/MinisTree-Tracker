import React, { useEffect } from 'react';
import { useNotifications } from '../../context/NotificationsContext';
import { useVisits } from '../../hooks/useVisits';
import { useTreeGrowth } from '../../hooks/useTreeGrowth';
import { useHoursData } from '../../hooks/useHoursData';

export const SystemNotificationsManager: React.FC = () => {
    const { checkAndGenerateNotifications, loading: loadingNotifs } = useNotifications();
    const { visits, loading: loadingVisits } = useVisits();
    const { stageIndex, loading: loadingTree } = useTreeGrowth();
    const { reports, loading: loadingHours } = useHoursData(new Date());

    useEffect(() => {
        // Only run when everything is loaded to avoid false positives or missing data
        if (!loadingNotifs && !loadingVisits && !loadingTree && !loadingHours) {
            // Ensure data isn't undefined before running
            if (visits !== undefined && stageIndex !== undefined && reports !== undefined) {
                checkAndGenerateNotifications(visits, stageIndex);
            }
        }
    }, [loadingNotifs, loadingVisits, loadingTree, loadingHours, visits, stageIndex, reports, checkAndGenerateNotifications]);

    return null; // This is a logic-only component
};
