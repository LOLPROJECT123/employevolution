
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { CompleteProfileDataService, CompleteProfileData, ProfileCompletionMetrics } from '@/services/completeProfileDataService';
import { EnhancedValidationService, ValidationResult } from '@/services/enhancedValidationService';
import { toast } from 'sonner';

export const useEnhancedProfileData = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<CompleteProfileData | null>(null);
  const [metrics, setMetrics] = useState<ProfileCompletionMetrics | null>(null);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load complete profile data
  const loadProfile = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      console.log('Loading enhanced profile data...');
      
      const [profileResult, metricsResult, validationResult] = await Promise.all([
        CompleteProfileDataService.loadCompleteProfile(user.id),
        CompleteProfileDataService.calculateProfileMetrics(user.id),
        EnhancedValidationService.validateCompleteProfile(user.id)
      ]);

      setProfileData(profileResult);
      setMetrics(metricsResult);
      setValidation(validationResult);

      console.log('Enhanced profile data loaded successfully');

    } catch (error) {
      console.error('Error loading enhanced profile data:', error);
      setError('Failed to load profile data');
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  // Save complete profile data
  const saveProfile = async (updatedData: CompleteProfileData) => {
    if (!user) return false;

    setSaving(true);
    setError(null);

    try {
      console.log('Saving enhanced profile data...');
      
      const success = await CompleteProfileDataService.saveCompleteProfile(user.id, updatedData);
      
      if (success) {
        setProfileData(updatedData);
        
        // Recalculate metrics and validation after save
        const [newMetrics, newValidation] = await Promise.all([
          CompleteProfileDataService.calculateProfileMetrics(user.id),
          EnhancedValidationService.validateCompleteProfile(user.id)
        ]);

        setMetrics(newMetrics);
        setValidation(newValidation);

        toast.success('Profile saved successfully!');
        console.log('Enhanced profile data saved successfully');
        return true;
      } else {
        throw new Error('Failed to save profile');
      }

    } catch (error) {
      console.error('Error saving enhanced profile data:', error);
      setError('Failed to save profile data');
      toast.error('Failed to save profile data');
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Update specific section
  const updateSection = async (section: keyof CompleteProfileData, data: any) => {
    if (!profileData) return false;

    const updatedProfile = {
      ...profileData,
      [section]: data
    };

    return await saveProfile(updatedProfile);
  };

  // Validate specific section
  const validateSection = async (section: keyof CompleteProfileData) => {
    if (!user) return null;

    try {
      return await EnhancedValidationService.validateSection(user.id, section);
    } catch (error) {
      console.error('Error validating section:', error);
      return null;
    }
  };

  // Get validation summary
  const getValidationSummary = async () => {
    if (!user) return null;

    try {
      return await EnhancedValidationService.getValidationSummary(user.id);
    } catch (error) {
      console.error('Error getting validation summary:', error);
      return null;
    }
  };

  // Refresh all data
  const refreshData = async () => {
    await loadProfile();
  };

  // Load profile on user change
  useEffect(() => {
    if (user) {
      loadProfile();
    } else {
      setProfileData(null);
      setMetrics(null);
      setValidation(null);
    }
  }, [user]);

  return {
    // Data
    profileData,
    metrics,
    validation,
    
    // State
    loading,
    saving,
    error,
    
    // Actions
    saveProfile,
    updateSection,
    validateSection,
    getValidationSummary,
    refreshData,
    
    // Computed values
    isProfileComplete: validation?.isValid || false,
    completionPercentage: metrics?.overallCompletion || 0,
    qualityScore: metrics?.qualityScore || 0,
    strengthScore: metrics?.strengthScore || 0,
    missingFields: validation?.errors?.map(e => e.field) || [],
    recommendations: metrics?.recommendations || [],
    nextSteps: metrics?.nextSteps || []
  };
};
