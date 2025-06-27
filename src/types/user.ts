export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  role: 'student' | 'teacher' | 'admin';
  subscription_status: 'free' | 'premium' | 'creator';
  is_trial?: boolean;
  trial_start_date?: string;
  trial_end_date?: string;
  trial_type?: 'teacher' | 'student';
  reddit_username?: string;
  revenuecat_user_id?: string;
  upload_count_this_month?: number;
  created_at: string;
  updated_at: string;
}

export interface UploadLimits {
  maxFileSize: number; // in bytes
  monthlyLimit: number | null; // null for unlimited
  formats: string[];
  features: string[];
}

export interface TrialInfo {
  isActive: boolean;
  type: 'teacher' | 'student';
  startDate: string;
  endDate: string;
  daysRemaining: number;
}