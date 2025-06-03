import { create } from 'zustand';
import { Reward, RewardRedemption } from '../types';
import supabase from '../lib/supabase';

interface RewardState {
  rewards: Reward[];
  redemptions: RewardRedemption[];
  loading: boolean;
  error: string | null;
  fetchRewards: (companyId: string) => Promise<void>;
  fetchRedemptions: (userId: string) => Promise<void>;
  redeemReward: (userId: string, rewardId: string, pointsCost: number) => Promise<boolean>;
  clearError: () => void;
}

const useRewardStore = create<RewardState>((set, get) => ({
  rewards: [],
  redemptions: [],
  loading: false,
  error: null,
  
  fetchRewards: async (companyId) => {
    try {
      set({ loading: true, error: null });
      
      const { data, error } = await supabase
        .from('rewards')
        .select('*')
        .eq('company_id', companyId)
        .order('point_cost', { ascending: true });
        
      if (error) throw error;
      
      set({ 
        rewards: data as Reward[],
        loading: false 
      });
    } catch (err) {
      set({ 
        error: err instanceof Error ? err.message : 'An error occurred while fetching rewards',
        loading: false 
      });
    }
  },
  
  fetchRedemptions: async (userId) => {
    try {
      set({ loading: true, error: null });
      
      const { data, error } = await supabase
        .from('reward_redemptions')
        .select(`
          *,
          rewards (
            name,
            point_cost
          )
        `)
        .eq('user_id', userId)
        .order('date', { ascending: false });
        
      if (error) throw error;
      
      set({ 
        redemptions: data as RewardRedemption[],
        loading: false 
      });
    } catch (err) {
      set({ 
        error: err instanceof Error ? err.message : 'An error occurred while fetching redemptions',
        loading: false 
      });
    }
  },
  
  redeemReward: async (userId, rewardId, pointsCost) => {
    try {
      set({ loading: true, error: null });
      
      // Start a transaction by using RPC
      const { data, error } = await supabase.rpc('redeem_reward', {
        p_user_id: userId,
        p_reward_id: rewardId,
        p_points_cost: pointsCost
      });
      
      if (error) throw error;
      
      // Refresh redemptions list
      await get().fetchRedemptions(userId);
      
      set({ loading: false });
      return true;
    } catch (err) {
      set({ 
        error: err instanceof Error ? err.message : 'An error occurred during reward redemption',
        loading: false 
      });
      return false;
    }
  },
  
  clearError: () => set({ error: null }),
}));

export default useRewardStore;