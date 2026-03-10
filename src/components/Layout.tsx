import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Home, Sword, Map as MapIcon, User } from 'lucide-react';
import { clsx } from 'clsx';

export default function Layout() {
  return (
    <div className="flex flex-col h-screen bg-[#0a192f] text-white font-sans overflow-hidden">
      <main className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </main>
      
      <nav className="fixed bottom-0 w-full bg-[#112240] border-t border-[#233554] flex justify-around items-center h-16 px-4 z-50">
        <NavItem to="/app" icon={<Home size={24} />} label="Forest" />
        <NavItem to="/app/quest" icon={<Sword size={24} />} label="Quest" />
        <NavItem to="/app/map" icon={<MapIcon size={24} />} label="Map" />
        <NavItem to="/app/profile" icon={<User size={24} />} label="Profile" />
      </nav>
    </div>
  );
}

function NavItem({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <NavLink
      to={to}
      end={to === '/app'}
      className={({ isActive }) =>
        clsx(
          "flex flex-col items-center justify-center w-16 h-full transition-colors",
          isActive ? "text-[#64ffda]" : "text-[#8892b0] hover:text-[#ccd6f6]"
        )
      }
    >
      {icon}
      <span className="text-[10px] mt-1 font-medium tracking-wider uppercase">{label}</span>
    </NavLink>
  );
}
