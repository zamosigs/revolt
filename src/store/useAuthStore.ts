import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';
import { type User } from '@supabase/supabase-js';

export type UserRole = 'SUPER_ADMIN' | 'OPERATIONS_MANAGER' | 'DISPATCH_MANAGER' | 'SALES_MANAGER' | 'DISPATCHER' | 'SALES_AGENT' | 'ACCOUNTANT' | 'CEO' | 'MD' | 'ADMIN';

interface Profile {
  id: string;
  full_name: string;
  role: UserRole;
  email: string;
  status: 'ACTIVE' | 'INACTIVE';
}

interface AuthState {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  initialize: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  isLoading: true,

  initialize: async () => {
    const supabase = createClient();
    
    // Get initial session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
        
      set({ user: session.user, profile, isLoading: false });
    } else {
      set({ user: null, profile: null, isLoading: false });
    }

    // Listen for auth changes
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        set({ user: session.user, profile, isLoading: false });
      } else {
        set({ user: null, profile: null, isLoading: false });
      }
    });
  },

  signOut: async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error during Supabase signout:', error);
    } finally {
      set({ user: null, profile: null });
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  },
}));
