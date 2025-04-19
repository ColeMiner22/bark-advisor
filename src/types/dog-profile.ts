export interface DogProfile {
  id: string;
  name: string;
  breed: string;
  weight: number;
  age: number;
  healthIssues: string[];
  dietaryRestrictions: string[];
}

export interface DogProfileInput {
  name: string;
  breed: string;
  weight: number;
  age: number;
  vet_issues: string | null;
  dietary_restrictions: string | null;
}

export interface DogProfile extends DogProfileInput {
  id: string;
  created_at: string;
  updated_at: string;
} 