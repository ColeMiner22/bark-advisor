import { DogProfile } from '@/types/dog-profile';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'dog_profiles';

// Helper function to get profiles from localStorage
const getStoredProfiles = (): DogProfile[] => {
  if (typeof window === 'undefined') return [];
  
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

// Helper function to save profiles to localStorage
const saveProfiles = (profiles: DogProfile[]) => {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
};

export const getAllDogProfiles = (): DogProfile[] => {
  return getStoredProfiles();
};

export const getDogProfileById = (id: string): DogProfile | undefined => {
  const profiles = getStoredProfiles();
  return profiles.find(profile => profile.id === id);
};

export const createDogProfile = (profile: Omit<DogProfile, 'id'>): DogProfile => {
  const profiles = getStoredProfiles();
  const newProfile: DogProfile = {
    ...profile,
    id: uuidv4(),
  };
  
  saveProfiles([...profiles, newProfile]);
  return newProfile;
};

export const updateDogProfile = (id: string, updatedProfile: Omit<DogProfile, 'id'>): DogProfile | undefined => {
  const profiles = getStoredProfiles();
  const index = profiles.findIndex(profile => profile.id === id);
  
  if (index === -1) return undefined;
  
  const updated: DogProfile = {
    ...updatedProfile,
    id,
  };
  
  profiles[index] = updated;
  saveProfiles(profiles);
  return updated;
};

export const deleteDogProfile = (id: string): boolean => {
  const profiles = getStoredProfiles();
  const filteredProfiles = profiles.filter(profile => profile.id !== id);
  
  if (filteredProfiles.length === profiles.length) return false;
  
  saveProfiles(filteredProfiles);
  return true;
}; 