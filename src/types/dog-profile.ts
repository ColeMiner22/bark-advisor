export interface DogProfile {
  id: string;
  user_id: string;
  name: string;
  breed: string;
  weight: number;
  vet_issues: string | null;
  dietary_restrictions: string | null;
  created_at?: string;
  updated_at?: string;
}

export type DogProfileInput = Omit<DogProfile, 'id' | 'user_id' | 'created_at' | 'updated_at'>; 