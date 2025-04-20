export interface DogProfile {
  id: string;
  name: string;
  breed: string;
  weight: number;
  age: number;
  healthIssues: string[];
  dietaryRestrictions: string[];
  vet_issues?: string;
  dietary_restrictions?: string;
}

export interface DogProfileInput {
  name: string;
  breed: string;
  weight: number;
  age: number;
  healthIssues: string[];
  dietaryRestrictions: string[];
  vet_issues?: string;
  dietary_restrictions?: string;
}

export interface DogProfile extends DogProfileInput {
  id: string;
  created_at: string;
  updated_at: string;
} 