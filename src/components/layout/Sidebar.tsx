"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  CheckSquare, 
  CreditCard, 
  FileText, 
  BarChart3, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  LogOut,
  Building2,
  ClipboardCheck,
  Package,
  Users
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/useAuthStore';
import { hasPermission, Module } from '@/lib/auth/permissions';

const menuItems: { icon: any, label: string, href: string, module: Module }[] = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard', module: 'dashboard' },
  { icon: ClipboardCheck, label: 'Load Booking', href: '/booking', module: 'booking' },
  { icon: Package, label: 'Load Management', href: '/loads', module: 'loads' },
  { icon: Building2, label: 'Clients', href: '/clients', module: 'clients' },
  { icon: Users, label: 'Employees', href: '/employees', module: 'employees' },
  { icon: CheckSquare, label: 'Tasks', href: '/tasks', module: 'tasks' },
  { icon: CreditCard, label: 'Payroll', href: '/payroll', module: 'payroll' },
  { icon: FileText, label: 'Daily Reports', href: '/reports', module: 'reports' },
  { icon: BarChart3, label: 'Analytics', href: '/analytics', module: 'reports' }, // Map analytics to reports module
  { icon: Settings, label: 'Settings', href: '/settings', module: 'settings' },
];

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { profile, signOut } = useAuthStore();

  const filteredItems = menuItems.filter(item => 
    profile && hasPermission(profile.role, item.module)
  );

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 80 : 260 }}
      className={cn(
        "relative flex flex-col border-r border-border bg-secondary h-screen transition-all duration-300 ease-in-out z-20",
        isCollapsed ? "px-3" : "px-4"
      )}
    >
      <div className="flex items-center justify-between py-8">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-orange text-white shadow-[0_0_15px_rgba(249,115,22,0.3)]">
            <Building2 size={24} />
          </div>
          {!isCollapsed && (
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xl font-black tracking-tighter text-foreground italic"
            >
              REVOLT
            </motion.span>
          )}
        </Link>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto custom-scrollbar">
        {filteredItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link key={item.label} href={item.href}>
              <div
                className={cn(
                  "group flex items-center rounded-xl px-3 py-3 text-sm font-semibold transition-all duration-300 cursor-pointer",
                  isActive 
                    ? "sidebar-active" 
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <item.icon className={cn("h-5 w-5", isCollapsed ? "mx-auto" : "mr-3")} />
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    {item.label}
                  </motion.span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="py-6 border-t border-border mt-auto">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex w-full items-center justify-center rounded-xl border border-border py-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors mb-4 cursor-pointer"
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
        
        <button 
          onClick={signOut}
          className="flex w-full items-center rounded-xl px-3 py-2.5 text-sm font-semibold text-brand-red hover:bg-brand-red/10 transition-colors cursor-pointer"
        >
          <LogOut className={cn("h-5 w-5", isCollapsed ? "mx-auto" : "mr-3")} />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </motion.aside>
  );
}

