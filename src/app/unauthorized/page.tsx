"use client";

import React from 'react';
import Link from 'next/link';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] p-6">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="flex justify-center">
          <div className="h-24 w-24 bg-brand-red/10 rounded-full flex items-center justify-center text-brand-red shadow-[0_0_50px_rgba(239,68,68,0.1)]">
            <ShieldAlert size={48} />
          </div>
        </div>
        
        <div className="space-y-4">
          <h1 className="text-3xl font-black text-white uppercase italic tracking-tight">Access Denied</h1>
          <p className="text-muted-foreground font-medium">
            Your security clearance level is insufficient to access this sector of the REVOLT system.
          </p>
        </div>

        <Link href="/dashboard" className="block">
          <Button variant="outline" className="w-full py-6 border-white/5 bg-secondary hover:bg-accent text-white font-black uppercase tracking-widest gap-2">
            <ArrowLeft size={18} />
            Return to Dashboard
          </Button>
        </Link>
        
        <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Security Protocol 403-B</p>
      </div>
    </div>
  );
}
