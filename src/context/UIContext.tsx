import React, { createContext, useContext, useState } from 'react';

interface UIContextType {
  isModalOpen: boolean;
  setIsModalOpen: (isOpen: boolean) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider = ({ children }: { children: React.ReactNode }) => {
  const [openModalsCount, setOpenModalsCount] = useState(0);

  const isModalOpen = openModalsCount > 0;

  const toggleModal = (isOpen: boolean) => {
    setOpenModalsCount(prev => isOpen ? prev + 1 : Math.max(0, prev - 1));
  };

  return (
    <UIContext.Provider value={{ isModalOpen, setIsModalOpen: toggleModal }}>
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};
