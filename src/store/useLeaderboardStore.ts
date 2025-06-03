import { create } from 'zustand';
import { LeaderboardEntry } from '../types';
import supabase from '../lib/supabase';

interface LeaderboardState {
  companyLeaderboard: LeaderboardEntry[];
  individualLeaderboard: LeaderboardEntry[];
  period: 'weekly' | 'monthly' | 'all-time';
  loading: boolean;
  error: string | null;
  fetchCompanyLeaderboard: () => Promise<void>;
  fetchIndividualLeaderboard: (companyId: string) => Promise<void>;
  setPeriod: (period: 'weekly' | 'monthly' | 'all-time') => void;
  clearError: () => void;
}

const useLeaderboardStore = create<LeaderboardState>((set, get) => ({
  companyLeaderboard: [],
  individualLeaderboard: [],
  period: 'weekly',
  loading: false,
  error: null,
  
  fetchCompanyLeaderboard: async () => {
    try {
      set({ loading: true, error: null });
      
      const { data, error } = await supabase
        .from('leaderboards')
        .select(`
          id,
          company_id,
          points,
          period,
          companies (
            name,
            logo_url
          )
        `)
        .eq('period', get().period)
        .order('points', { ascending: false });
        
      if (error) throw error;
      
      // Add rank to each entry
      const rankedData = data.map((entry, index) => ({
        ...entry,
        rank: index + 1
      }));
      
      set({ 
        companyLeaderboard: rankedData as LeaderboardEntry[],
        loading: false 
      });
    } catch (err) {
      set({ 
        error: err instanceof Error ? err.message : 'An error occurred while fetching company leaderboard',
        loading: false 
      });
    }
  },
  
  fetchIndividualLeaderboard: async (companyId) => {
    try {
      set({ loading: true, error: null });
      
      const { data, error } = await supabase
        .from('leaderboards')
        .select(`
          id,
          user_id,
          company_id,
          points,
          period,
          users (
            name,
            avatar_url
          )
        `)
        .eq('company_id', companyId)
        .eq('period', get().period)
        .order('points', { ascending: false });
        
      if (error) throw error;
      
      // Add rank to each entry
      const rankedData = data.map((entry, index) => ({
        ...entry,
        rank: index + 1
      }));
      
      set({ 
        individualLeaderboard: rankedData as LeaderboardEntry[],
        loading: false 
      });
    } catch (err) {
      set({ 
        error: err instanceof Error ? err.message : 'An error occurred while fetching individual leaderboard',
        loading: false 
      });
    }
  },
  
  setPeriod: (period) => set({ period }),
  
  clearError: () => set({ error: null }),
}));

export default useLeaderboardStore;