import { create } from 'zustand';
import { User } from '../types';
import supabase from '../lib/supabase';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, company: string, role: 'HR Admin' | 'Employee') => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: false,
  error: null,
  isAuthenticated: false,
  
  signIn: async (email, password) => {
    try {
      set({ loading: true, error: null });
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      if (data?.user) {
        // Fetch user profile data
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();
          
        if (userError) throw userError;
        
        set({ 
          user: userData as User,
          isAuthenticated: true,
          loading: false 
        });
      }
    } catch (err) {
      set({ 
        error: err instanceof Error ? err.message : 'An error occurred during sign in',
        loading: false 
      });
    }
  },
  
  signUp: async (email, password, name, company, role) => {
    try {
      set({ loading: true, error: null });
      
      // Sign up user with Supabase auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) throw error;
      
      if (data?.user) {
        // Create company if user is HR Admin
        let company_id = '';
        
        if (role === 'HR Admin') {
          const { data: companyData, error: companyError } = await supabase
            .from('companies')
            .insert([
              { 
                name: company,
                working_days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                tier: 'free' 
              }
            ])
            .select()
            .single();
            
          if (companyError) throw companyError;
          company_id = companyData.id;
        } else {
          // Find company by name for employees
          const { data: companyData, error: companyError } = await supabase
            .from('companies')
            .select('id')
            .eq('name', company)
            .single();
            
          if (companyError) throw companyError;
          company_id = companyData.id;
        }
        
        // Create user profile
        const { error: profileError } = await supabase
          .from('users')
          .insert([
            {
              id: data.user.id,
              email,
              name,
              role,
              company_id,
              points: 0,
              theme_preference: 'dark'
            }
          ]);
          
        if (profileError) throw profileError;
        
        set({ 
          user: {
            id: data.user.id,
            email,
            name,
            role,
            company_id,
            points: 0,
            theme_preference: 'dark'
          },
          isAuthenticated: true,
          loading: false 
        });
      }
    } catch (err) {
      set({ 
        error: err instanceof Error ? err.message : 'An error occurred during sign up',
        loading: false 
      });
    }
  },
  
  signOut: async () => {
    try {
      set({ loading: true });
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      set({ 
        user: null,
        isAuthenticated: false,
        loading: false 
      });
    } catch (err) {
      set({ 
        error: err instanceof Error ? err.message : 'An error occurred during sign out',
        loading: false 
      });
    }
  },
  
  clearError: () => set({ error: null }),
}));

export default useAuthStore;