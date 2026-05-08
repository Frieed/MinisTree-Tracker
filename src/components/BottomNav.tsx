import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Clock, User, Map as MapIcon, TreePine } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const BottomNav = () => {
  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Clock, label: 'Hours', path: '/hours' },
    { icon: MapIcon, label: 'Map', path: '/map' },
    { icon: TreePine, label: 'Tree', path: '/tree' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-nature-cream px-6 py-3 pb-8 flex justify-between items-center z-50">
      {navItems.map(({ icon: Icon, label, path }) => (
        <NavLink
          key={path}
          to={path}
          className={({ isActive }) =>
            cn(
              "bottom-nav-item flex flex-col items-center gap-1 transition-all duration-300",
              isActive ? "text-nature-green-dark" : "text-nature-brown-light"
            )
          }
        >
          <Icon className="w-6 h-6" />
          <span className="text-[10px] font-medium uppercase tracking-wider">{label}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export default BottomNav;
