import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, debugCurrentUser } from '../lib/supabase';
import { initializeRevenueCat, isRevenueCatAvailable, getMockSubscriptionStatus } from '../lib/integrations/revenuecat';
import { UserProfile } from '../types/user';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, role: 'student' | 'teacher') => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  startTrial: (trialType: 'teacher' | 'student') => Promise<void>;
  checkTrialStatus: () => Promise<boolean>;
  promoteToCreator: () => Promise<void>;
  canUploadVideos: () => boolean;
  getUploadLimits: () => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('AuthProvider: Initializing...');
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Error getting session:', error);
      }
      
      console.log('Initial session:', session?.user?.id || 'No session');
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchProfile(session.user.id);
        // Try to initialize RevenueCat, but don't fail if it's not available
        initializeRevenueCat(session.user.id).catch(() => {
          console.debug('RevenueCat initialization skipped - continuing without subscription features');
        });
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id || 'No user');
        
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
          // Try to initialize RevenueCat, but don't fail if it's not available
          initializeRevenueCat(session.user.id).catch(() => {
            console.debug('RevenueCat initialization skipped - continuing without subscription features');
          });
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      console.log('Fetching profile for user:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        throw error;
      }
      
      console.log('Profile fetched:', data);
      setProfile(data);

      // Check if trial has expired
      if (data?.is_trial && data?.trial_end_date) {
        const trialEnd = new Date(data.trial_end_date);
        const now = new Date();
        
        if (now > trialEnd) {
          console.log('Trial expired, ending trial...');
          // Trial has expired, end it
          await endTrial(userId);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Don't throw error, just log it
    }
  };

  const signIn = async (email: string, password: string) => {
    console.log('Signing in user:', email);
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error('Sign in error:', error);
      throw error;
    }
    
    console.log('Sign in successful');
  };

  const signUp = async (email: string, password: string, fullName: string, role: 'student' | 'teacher') => {
    console.log('Signing up user:', email, 'as', role);
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) {
      console.error('Sign up error:', error);
      throw error;
    }

    if (data.user) {
      console.log('Creating profile for new user:', data.user.id);
      
      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          email,
          full_name: fullName,
          role,
          subscription_status: 'free',
          revenuecat_user_id: data.user.id,
          upload_count_this_month: 0,
        });
        
      if (profileError) {
        console.error('Profile creation error:', profileError);
        throw profileError;
      }
      
      console.log('Profile created successfully');
    }
  };

  const signOut = async () => {
    console.log('Signing out user');
    
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Sign out error:', error);
      throw error;
    }
    
    console.log('Sign out successful');
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) throw new Error('No user logged in');

    console.log('Updating profile for user:', user.id, updates);

    const { error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (error) {
      console.error('Profile update error:', error);
      throw error;
    }
    
    console.log('Profile updated successfully');
    await fetchProfile(user.id);
  };

  const startTrial = async (trialType: 'teacher' | 'student') => {
    if (!user) throw new Error('No user logged in');

    console.log('Starting trial for user:', user.id, 'type:', trialType);

    try {
      const { error } = await supabase.rpc('start_trial', {
        user_id: user.id,
        trial_type_param: trialType
      });

      if (error) {
        console.error('Start trial error:', error);
        throw error;
      }
      
      console.log('Trial started successfully');
      await fetchProfile(user.id);
    } catch (error) {
      console.error('Failed to start trial:', error);
      throw error;
    }
  };

  const endTrial = async (userId: string) => {
    try {
      console.log('Ending trial for user:', userId);
      
      const { error } = await supabase.rpc('end_trial', {
        user_id: userId
      });

      if (error) {
        console.error('End trial error:', error);
        throw error;
      }
      
      console.log('Trial ended successfully');
      await fetchProfile(userId);
    } catch (error) {
      console.error('Failed to end trial:', error);
    }
  };

  const checkTrialStatus = async (): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase.rpc('is_trial_expired', {
        user_id: user.id
      });

      if (error) {
        console.error('Check trial status error:', error);
        throw error;
      }
      
      return !data; // Return true if trial is NOT expired
    } catch (error) {
      console.error('Failed to check trial status:', error);
      return false;
    }
  };

  const promoteToCreator = async () => {
    if (!user) throw new Error('No user logged in');

    console.log('Promoting user to creator:', user.id);

    try {
      const { error } = await supabase.rpc('promote_to_creator', {
        user_id: user.id
      });

      if (error) {
        console.error('Promote to creator error:', error);
        throw error;
      }
      
      console.log('User promoted to creator successfully');
      await fetchProfile(user.id);
    } catch (error) {
      console.error('Failed to promote to creator:', error);
      throw error;
    }
  };

  const canUploadVideos = (): boolean => {
    if (!profile) {
      console.log('No profile, cannot upload');
      return false;
    }
    
    // Teachers can always upload
    if (profile.role === 'teacher') {
      console.log('User is teacher, can upload');
      return true;
    }
    
    // Creator subscription holders can upload
    if (profile.subscription_status === 'creator') {
      console.log('User has creator subscription, can upload');
      return true;
    }
    
    // Trial users can upload
    if (profile.is_trial) {
      console.log('User is on trial, can upload');
      return true;
    }
    
    // Premium users can upload (with limits)
    if (profile.subscription_status === 'premium') {
      console.log('User has premium subscription, can upload');
      return true;
    }
    
    console.log('User cannot upload videos');
    return false;
  };

  const getUploadLimits = async () => {
    if (!user) return null;

    try {
      const { data, error } = await supabase.rpc('get_upload_limits', {
        user_id: user.id
      });

      if (error) {
        console.error('Get upload limits error:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Failed to get upload limits:', error);
      return null;
    }
  };

  const value = {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    startTrial,
    checkTrialStatus,
    promoteToCreator,
    canUploadVideos,
    getUploadLimits,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};