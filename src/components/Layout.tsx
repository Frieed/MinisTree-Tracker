import { useState, useRef } from 'react';
import { Outlet, NavLink, useLocation, Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Clock, Leaf, CalendarDays, TreePine, Settings, Bell, Sprout } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUI } from '../context/UIContext';
import { UnsavedChangesModal } from './common/UnsavedChangesModal';
import { SystemNotificationsManager } from './common/SystemNotificationsManager';
import { LevelUpModal } from './tree/LevelUpModal';
import { useTreeGrowth } from '../hooks/useTreeGrowth';
import { useNotifications } from '../context/NotificationsContext';

const Layout = () => {
  const [isVisible, setIsVisible] = useState(true);
  const { notifications } = useNotifications();
  const hasUnread = notifications.some(n => !n.is_read);
  const { isModalOpen } = useUI();
  const lastScrollY = useRef(0);
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    showLevelUp, dismissLevelUp, stageIndex, currentStage 
  } = useTreeGrowth();

  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [pendingTo, setPendingTo] = useState<string | null>(null);

  const handleScroll = (e: React.UIEvent<HTMLElement>) => {
    const currentScrollY = e.currentTarget.scrollTop;
    if (currentScrollY > lastScrollY.current + 15) {
      setIsVisible(false);
    } else if (currentScrollY < lastScrollY.current - 10 || currentScrollY < 20) {
      setIsVisible(true);
    }
    lastScrollY.current = currentScrollY;
  };

  const handleConfirmLeave = () => {
    if (pendingTo) {
      setShowUnsavedModal(false);
      navigate(pendingTo);
    }
  };

  return (
    <div className="h-[100dvh] max-h-[100dvh] bg-nature-cream flex flex-col max-w-md mx-auto relative shadow-2xl overflow-hidden">
      <SystemNotificationsManager />
      {/* Header / Brand */}
      <header className={`absolute top-0 w-full z-[50] p-6 pb-2 bg-nature-cream/95 backdrop-blur-xl flex items-center justify-between transition-transform duration-500 ease-in-out ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-nature-green rounded-xl flex items-center justify-center shadow-soft">
            <Leaf className="text-white w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-nature-brown-dark tracking-tight">MinisTree</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/notifications" className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-soft text-nature-brown hover:text-nature-green transition-colors relative">
            <Bell size={20} />
            {hasUnread && (
              <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
            )}
          </Link>
          <Link to="/settings" className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-soft text-nature-brown hover:text-nature-green transition-colors">
            <Settings size={20} />
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main onScroll={handleScroll} className={`flex-1 ${isModalOpen ? 'overflow-hidden' : 'overflow-y-auto'} pt-[4.5rem] pb-10 scrollbar-hide`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{
              duration: 0.3,
              ease: [0.22, 1, 0.36, 1]
            }}
            style={{ willChange: 'transform, opacity' }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <motion.nav
        initial={false}
        animate={{
          y: isVisible && !isModalOpen ? 0 : 120,
          opacity: isVisible && !isModalOpen ? 1 : 0,
          scale: isVisible && !isModalOpen ? 1 : 0.95,
        }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 30,
        }}
        style={{
          x: '-50%',
          pointerEvents: isVisible && !isModalOpen ? 'auto' : 'none',
          willChange: 'transform, opacity',
        }}
        className="fixed bottom-5 left-1/2 w-[88%] max-w-[400px] bg-white/90 backdrop-blur-lg border border-nature-cream-light py-2 px-6 flex justify-between items-center z-[40] rounded-[2.5rem] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.15)]"
      >
        <NavItem to="/" icon={<LayoutDashboard size={22} />} label="Home" onNavigateClick={(to) => { setPendingTo(to); setShowUnsavedModal(true); }} />
        <NavItem to="/hours" icon={<Clock size={22} />} label="Hours" onNavigateClick={(to) => { setPendingTo(to); setShowUnsavedModal(true); }} />
        <NavItem to="/schedule" icon={<CalendarDays size={22} />} label="Schedule" onNavigateClick={(to) => { setPendingTo(to); setShowUnsavedModal(true); }} />
        <NavItem to="/map" icon={<Sprout size={22} />} label="Garden" onNavigateClick={(to) => { setPendingTo(to); setShowUnsavedModal(true); }} />
        <NavItem to="/tree" icon={<TreePine size={22} />} label="Tree" onNavigateClick={(to) => { setPendingTo(to); setShowUnsavedModal(true); }} />
      </motion.nav>

      <UnsavedChangesModal
        isOpen={showUnsavedModal}
        onClose={() => setShowUnsavedModal(false)}
        onConfirm={handleConfirmLeave}
      />

      <LevelUpModal 
        show={showLevelUp} 
        onClose={dismissLevelUp} 
        stageIndex={stageIndex} 
        message={currentStage?.message || ''} 
      />
    </div>
  );
};

const NavItem = ({ to, icon, label, onNavigateClick }: { to: string; icon: React.ReactNode; label: string; onNavigateClick: (to: string) => void }) => {
  const { hasUnsavedChanges } = useUI();
  const location = useLocation();

  const handleClick = (e: React.MouseEvent) => {
    if (hasUnsavedChanges && location.pathname !== to) {
      e.preventDefault();
      onNavigateClick(to);
    }
  };

  return (
    <NavLink
      to={to}
      onClick={handleClick}
      className={({ isActive }) =>
        `bottom-nav-item group relative ${isActive ? 'active' : ''}`
      }
    >
      {({ isActive }) => (
        <>
          <div className={`p-3 rounded-2xl transition-all duration-300 ${isActive ? 'bg-nature-green/10 text-nature-green scale-110' : 'text-nature-brown-light hover:bg-nature-cream'}`}>
            {icon}
          </div>
          <span className="absolute -bottom-4 text-[9px] font-bold tracking-wider uppercase opacity-0 scale-75 transition-all duration-300 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:-bottom-1">
            {label}
          </span>
        </>
      )}
    </NavLink>
  );
};

export default Layout;
