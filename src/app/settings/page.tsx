"use client";

import React from 'react';
import { 
  User, 
  Building, 
  Bell, 
  Shield, 
  Palette, 
  Save,
  Settings,
  CheckCircle,
  X,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/useAuthStore';
import { PageHeader } from '@/components/ui/enterprise/PageHeader';
import { GlassCard } from '@/components/ui/enterprise/GlassCard';
import { updateMyPasswordAction } from '@/app/actions/settings';
import { motion, AnimatePresence } from 'framer-motion';


const sections = [
  { id: 'profile', label: 'Identity Profile', icon: User },
  { id: 'company', label: 'Entity Settings', icon: Building },
  { id: 'notifications', label: 'Alert Protocol', icon: Bell },
  { id: 'permissions', label: 'Access Control', icon: Shield },
  { id: 'appearance', label: 'Visual Interface', icon: Palette },
];

export default function SettingsPage() {
  const { profile, signOut } = useAuthStore();
  const [password, setPassword] = React.useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = React.useState(false);
  const [toastData, setToastData] = React.useState<{ visible: boolean; type: 'success' | 'error'; message: string; title: string }>({ visible: false, type: 'success', message: '', title: '' });

  const showToast = (type: 'success' | 'error', title: string, message: string) => {
    setToastData({ visible: true, type, title, message });
    if (type === 'error') {
      setTimeout(() => setToastData(prev => ({ ...prev, visible: false })), 5000);
    }
  };



  const handleUpdatePassword = async () => {
    if (!password || password.length < 6) {
      showToast('error', 'Invalid Password', 'Password must be at least 6 characters.');
      return;
    }
    
    setIsUpdatingPassword(true);
    setToastData(prev => ({ ...prev, visible: false }));
    try {
      const result = await updateMyPasswordAction(password);
      
      if (!result.success) {
        showToast('error', 'Update Failed', result.error || 'An unknown error occurred.');
        setIsUpdatingPassword(false);
      } else {
        showToast('success', 'Password Updated', 'Your password has successfully changed. Logging out...');
        setPassword('');
        setIsUpdatingPassword(false);
        setTimeout(async () => {
          await signOut();
        }, 2000);
      }
    } catch (err: any) {
      console.error('Password update error:', err);
      showToast('error', 'System Error', err.message || 'An unexpected error occurred.');
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader 
        title="System Settings" 
        subtitle="Configure Administrative Parameters & User Preferences"
        icon={Settings}
      />

      <div className="flex flex-col lg:flex-row gap-6">
        <aside className="w-full lg:w-64 flex flex-col gap-1.5">
          {sections.map((section) => (
            <button
              key={section.id}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-[9px] font-black uppercase italic tracking-widest transition-all hover:bg-brand-orange/10 text-muted-foreground hover:text-brand-orange group text-left"
            >
              <section.icon size={16} className="group-hover:scale-110 transition-transform" />
              {section.label}
            </button>
          ))}
        </aside>

        <div className="flex-1 flex flex-col gap-6">
          <GlassCard className="p-6" density="compact">
            <div className="mb-6 border-b border-border/50 pb-4">
              <h3 className="text-lg font-black italic uppercase tracking-tighter mb-0.5">Identity Management</h3>
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest opacity-70">Update your operational profile credentials.</p>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-6 pb-6 border-b border-border/30">
                <div className="h-16 w-16 rounded-xl bg-brand-orange text-white flex items-center justify-center text-xl font-black italic shadow-md">
                  {profile?.full_name?.split(' ').map((n: string) => n[0]).join('')}
                </div>
                <div className="flex flex-col gap-2">
                  <Button variant="outline" size="sm" className="rounded-md h-8 px-4 font-black uppercase italic text-[9px] border-brand-orange/30 text-brand-orange hover:bg-brand-orange hover:text-white transition-all">
                    Modify Avatar
                  </Button>
                  <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-tighter opacity-60 italic">JPG, PNG (MAX 800KB)</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1 italic opacity-80">Full Name</label>
                  <input 
                    type="text" 
                    defaultValue={profile?.full_name}
                    className="w-full h-10 px-3.5 bg-secondary/20 border border-border/40 rounded-lg text-xs font-bold outline-none focus:ring-1 focus:ring-brand-orange/30 focus:border-brand-orange/50 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1 italic opacity-80">Verified Email</label>
                  <input 
                    type="email" 
                    defaultValue={profile?.email}
                    className="w-full h-10 px-3.5 bg-secondary/20 border border-border/40 rounded-lg text-xs font-bold outline-none focus:ring-1 focus:ring-brand-orange/30 focus:border-brand-orange/50 transition-all opacity-50 cursor-not-allowed"
                    disabled
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1 italic opacity-80">Professional Abstract</label>
                <textarea 
                  className="w-full px-4 py-3 bg-secondary/20 border border-border/40 rounded-lg font-bold text-xs outline-none focus:ring-1 focus:ring-brand-orange/30 focus:border-brand-orange/50 transition-all min-h-[100px] tracking-tight placeholder:text-muted-foreground/30"
                  placeholder="Document your operational bio..."
                />
              </div>

              <div className="flex justify-end">
                <Button className="rounded-lg h-11 px-8 bg-brand-orange hover:bg-brand-orange/90 text-white font-black uppercase italic shadow-lg transition-all group text-sm">
                  <Save size={16} className="mr-2 group-hover:scale-110 transition-transform" />
                  Commit Changes
                </Button>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6" density="compact">
            <div className="mb-6 border-b border-border/50 pb-4">
              <h3 className="text-lg font-black italic uppercase tracking-tighter mb-0.5">Security Protocol</h3>
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest opacity-70">Update your access credentials.</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1 italic opacity-80">New Password</label>
                <div className="flex gap-4">
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="flex-1 h-11 px-4 bg-secondary/20 border border-border/40 rounded-lg text-xs font-bold outline-none focus:ring-1 focus:ring-brand-orange/30 focus:border-brand-orange/50 transition-all placeholder:italic"
                    placeholder="Enter new password (min. 6 characters)..."
                  />
                  <Button 
                    onClick={handleUpdatePassword}
                    disabled={isUpdatingPassword || !password}
                    className="rounded-lg h-11 px-8 bg-brand-orange hover:bg-brand-orange/90 text-white font-black uppercase italic shadow-lg transition-all group text-sm"
                  >
                    <Shield size={16} className="mr-2 group-hover:scale-110 transition-transform" />
                    {isUpdatingPassword ? 'Updating...' : 'Update Password'}
                  </Button>
                </div>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6" density="compact">
            <div className="mb-6 border-b border-border/50 pb-4">
              <h3 className="text-lg font-black italic uppercase tracking-tighter mb-0.5">Transmission Protocols</h3>
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest opacity-70">Configure automated system notifications.</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between px-5 py-4 bg-secondary/20 rounded-xl border border-border/30 group hover:border-brand-orange/30 transition-all">
                <div>
                  <p className="text-xs font-black italic uppercase tracking-tight">Email Telemetry</p>
                  <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter mt-0.5 opacity-60">Mission-critical updates and fiscal reports.</p>
                </div>
                <input type="checkbox" defaultChecked className="h-5 w-5 rounded-md border-border text-brand-orange focus:ring-brand-orange cursor-pointer" />
              </div>
              <div className="flex items-center justify-between px-5 py-4 bg-secondary/20 rounded-xl border border-border/30 group hover:border-brand-orange/30 transition-all">
                <div>
                  <p className="text-xs font-black italic uppercase tracking-tight">Push Manifests</p>
                  <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter mt-0.5 opacity-60">Real-time operational alerts for urgent tasks.</p>
                </div>
                <input type="checkbox" defaultChecked className="h-5 w-5 rounded-md border-border text-brand-orange focus:ring-brand-orange cursor-pointer" />
              </div>
            </div>
          </GlassCard>
        </div>
      </div>

      <AnimatePresence>
        {toastData.visible && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={`fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 w-80 p-4 bg-[#0A0A0A] border-2 rounded-xl shadow-2xl ${
              toastData.type === 'error' 
                ? 'border-brand-red/40 shadow-brand-red/20' 
                : 'border-emerald-500/40 shadow-emerald-500/20'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className={`flex items-center gap-2 ${toastData.type === 'error' ? 'text-brand-red' : 'text-emerald-500'}`}>
                {toastData.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
                <h4 className="font-black italic uppercase tracking-widest text-xs">{toastData.title}</h4>
              </div>
              <button 
                onClick={() => setToastData(prev => ({ ...prev, visible: false }))}
                className="text-muted-foreground hover:text-white transition-colors"
              >
                <X size={14} />
              </button>
            </div>
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight leading-relaxed">
              {toastData.message}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
