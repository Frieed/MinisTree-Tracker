import React, { createContext, useContext, useState } from 'react';

interface ServiceYearContextType {
    serviceYear: number; // Starting year (e.g., 2025 for 2025-26 service year)
    setServiceYear: (year: number) => void;
    startDate: Date;
    endDate: Date;
    displayName: string;
}

const ServiceYearContext = createContext<ServiceYearContextType | undefined>(undefined);

export const ServiceYearProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const today = new Date();
    // Service Year starts in September (month 8)
    const currentStartYear = today.getMonth() >= 8 ? today.getFullYear() : today.getFullYear() - 1;
    const [serviceYear, setServiceYear] = useState(currentStartYear);

    const startDate = new Date(serviceYear, 8, 1);
    const endDate = new Date(serviceYear + 1, 7, 31);
    const displayName = `${serviceYear}-${serviceYear + 1}`;

    return (
        <ServiceYearContext.Provider value={{ serviceYear, setServiceYear, startDate, endDate, displayName }}>
            {children}
        </ServiceYearContext.Provider>
    );
};

export const useServiceYear = () => {
    const context = useContext(ServiceYearContext);
    if (context === undefined) {
        throw new Error('useServiceYear must be used within a ServiceYearProvider');
    }
    return context;
};
