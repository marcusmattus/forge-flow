import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, Dumbbell, Utensils, Map as MapIcon, User } from 'lucide-react';
import { clsx } from 'clsx';
import { Logo } from './Logo';

export default function Layout() {
  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <nav className="w-full md:w-24 bg-brand-black flex flex-row md:flex-col items-center py-4 md:py-8 gap-4 md:gap-8 sticky top-0 md:h-screen z-50">
        <div className="px-4 md:px-0 mb-0 md:mb-8">
          <Logo />
        </div>
        
        <div className="flex flex-row md:flex-col flex-1 justify-center gap-4 md:gap-6 px-4">
          <NavItem to="/app/dashboard" icon={<LayoutDashboard size={28} />} label="Home" />
          <NavItem to="/app/workout/hiit" icon={<Dumbbell size={28} />} label="Workout" />
          <NavItem to="/app/nutrition" icon={<Utensils size={28} />} label="Eat" />
          <NavItem to="/app/gps" icon={<MapIcon size={28} />} label="Run" />
          <NavItem to="/app/profile" icon={<User size={28} />} label="Profile" />
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 bg-[#f0f0f0]">
        <div className="max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

function NavItem({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        clsx(
          "p-3 border-4 transition-all group relative",
          isActive 
            ? "bg-brand-yellow border-brand-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -translate-x-1 -translate-y-1" 
            : "bg-white border-transparent hover:border-brand-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-1 hover:-translate-y-1"
        )
      }
    >
      <div className="text-brand-black">
        {icon}
      </div>
      <span className="absolute left-full ml-4 px-2 py-1 bg-brand-black text-white text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap hidden md:block border-2 border-white">
        {label}
      </span>
    </NavLink>
  );
}
