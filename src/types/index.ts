export interface User {
  id: string;
  email: string;
  name: string;
  role: 'HR Admin' | 'Employee';
  company_id: string;
  points: number;
  theme_preference: 'dark' | 'light';
  avatar_url?: string;
}

export interface Company {
  id: string;
  name: string;
  logo_url?: string;
  working_days: string[];
  tier: 'free' | 'premium';
  api_key?: string;
}

export interface Habit {
  id: string;
  user_id: string;
  company_id: string;
  type: string;
  duration: number;
  date: string;
  points_earned: number;
}

export interface Reward {
  id: string;
  company_id: string;
  name: string;
  description: string;
  point_cost: number;
  stock: number;
  image_url?: string;
}

export interface Badge {
  id: string;
  user_id: string;
  name: string;
  description: string;
  date_earned: string;
  image_url?: string;
}

export interface LeaderboardEntry {
  id: string;
  company_id: string;
  user_id: string;
  points: number;
  period: 'weekly' | 'monthly' | 'all-time';
  rank?: number;
  user?: User;
}

export interface HabitType {
  id: string;
  company_id: string;
  name: string;
  points_per_minute: number;
  icon?: string;
  color?: string;
}

export interface RewardRedemption {
  id: string;
  user_id: string;
  reward_id: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  points_spent: number;
}

export type ThemeType = 'dark' | 'light';