export interface DogProfile {
  name: string;
  breed: string;
  weight: number;
  age: number;
  healthIssues?: string[];
  dietaryRestrictions?: string[];
  severity?: number;
}

export interface DogProfileInput {
  name: string;
  breed: string;
  weight: number;
  age: number;
  healthIssues?: string | string[];
  dietaryRestrictions?: string | string[];
  severity?: number;
} 