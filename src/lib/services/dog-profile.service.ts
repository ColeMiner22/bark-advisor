import { supabase } from '../supabase';
import { DogProfile, DogProfileInput } from '@/types/dog-profile';

export const dogProfileService = {
  /**
   * Get all dog profiles for the current user
   */
  async getUserDogProfiles(): Promise<DogProfile[]> {
    const { data, error } = await supabase
      .from('dog_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching dog profiles:', error);
      throw error;
    }

    return data || [];
  },

  /**
   * Get a single dog profile by ID
   */
  async getDogProfile(id: string): Promise<DogProfile | null> {
    const { data, error } = await supabase
      .from('dog_profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching dog profile:', error);
      throw error;
    }

    return data;
  },

  /**
   * Create a new dog profile
   */
  async createDogProfile(profile: DogProfileInput): Promise<DogProfile> {
    const { data, error } = await supabase
      .from('dog_profiles')
      .insert([profile])
      .select()
      .single();

    if (error) {
      console.error('Error creating dog profile:', error);
      throw error;
    }

    return data;
  },

  /**
   * Update an existing dog profile
   */
  async updateDogProfile(id: string, profile: Partial<DogProfileInput>): Promise<DogProfile> {
    const { data, error } = await supabase
      .from('dog_profiles')
      .update(profile)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating dog profile:', error);
      throw error;
    }

    return data;
  },

  /**
   * Delete a dog profile
   */
  async deleteDogProfile(id: string): Promise<void> {
    const { error } = await supabase
      .from('dog_profiles')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting dog profile:', error);
      throw error;
    }
  }
}; 