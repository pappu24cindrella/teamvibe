import { create } from 'zustand';
import { Habit, HabitType } from '../types';
import supabase from '../lib/supabase';

interface HabitState {
  habits: Habit[];
  habitTypes: HabitType[];
  loading: boolean;
  error: string | null;
  fetchHabits: (userId: string) => Promise<void>;
  fetchHabitTypes: (companyId: string) => Promise<void>;
  logHabit: (habit: Omit<Habit, 'id'>) => Promise<Habit | null>;
  clearError: () => void;
}

const useHabitStore = create<HabitState>((set, get) => ({
  habits: [],
  habitTypes: [],
  loading: false,
  error: null,
  
  fetchHabits: async (userId) => {
    try {
      set({ loading: true, error: null });
      
      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });
        
      if (error) throw error;
      
      set({ 
        habits: data as Habit[],
        loading: false 
      });
    } catch (err) {
      set({ 
        error: err instanceof Error ? err.message : 'An error occurred while fetching habits',
        loading: false 
      });
    }
  },
  
  fetchHabitTypes: async (companyId) => {
    try {
      set({ loading: true, error: null });
      
      const { data, error } = await supabase
        .from('habit_types')
        .select('*')
        .eq('company_id', companyId);
        
      if (error) throw error;
      
      set({ 
        habitTypes: data as HabitType[],
        loading: false 
      });
    } catch (err) {
      set({ 
        error: err instanceof Error ? err.message : 'An error occurred while fetching habit types',
        loading: false 
      });
    }
  },
  
  logHabit: async (habit) => {
    try {
      set({ loading: true, error: null });
      
      const { data, error } = await supabase
        .from('habits')
        .insert([habit])
        .select()
        .single();
        
      if (error) throw error;
      
      // Update habits list
      set({ 
        habits: [data as Habit, ...get().habits],
        loading: false 
      });
      
      return data as Habit;
    } catch (err) {
      set({ 
        error: err instanceof Error ? err.message : 'An error occurred while logging habit',
        loading: false 
      });
      return null;
    }
  },
  
  clearError: () => set({ error: null }),
}));

export default useHabitStore;