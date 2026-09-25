'use client';

// ============================================================================
// Revolt Ledger — Auth Hook
// ============================================================================
// Client-side hook for Ledger authentication state.
// Fetches the ledger_users record to determine Ledger role.
// ============================================================================

import { create } from 'zustand';
import { createLedgerClient } from '../lib/supabase/client';
import { signOutLedgerAction } from '../actions/auth';
import type { User } from '@supabase/supabase-js';
import type { LedgerRole, LedgerUser } from '../types';

interface LedgerAuthState {
  user: User | null;
  ledgerUser: LedgerUser | null;
  isLoading: boolean;
  isInitialized: boolean;
  initialize: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useLedgerAuthStore = create<LedgerAuthState>((set, get) => ({
  user: null,
  ledgerUser: null,
  isLoading: true,
  isInitialized: false,

  initialize: async () => {
    // Prevent double-initialization
    if (get().isInitialized) return;

    const supabase = createLedgerClient();

    // Get current session
    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
      // Fetch ledger user record
      const { data: ledgerUser } = await supabase
        .from('ledger_users')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      set({
        user: session.user,
        ledgerUser: ledgerUser || null,
        isLoading: false,
        isInitialized: true,
      });
    } else {
      set({ user: null, ledgerUser: null, isLoading: false, isInitialized: true });
    }

    // Listen for auth state changes
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        const { data: ledgerUser } = await supabase
          .from('ledger_users')
          .select('*')
          .eq('user_id', session.user.id)
          .single();

        set({
          user: session.user,
          ledgerUser: ledgerUser || null,
          isLoading: false,
        });
      } else {
        set({ user: null, ledgerUser: null, isLoading: false });
      }
    });
  },

  signOut: async () => {
    try {
      const supabase = createLedgerClient();
      await supabase.auth.signOut();
      await signOutLedgerAction();
    } catch (error) {
      console.error('Ledger signout error:', error);
    } finally {
      set({ user: null, ledgerUser: null, isInitialized: false, isLoading: false });
      if (typeof window !== 'undefined') {
        window.location.href = '/ledger/login';
      }
    }
  },
}));
