import { useState } from 'react';
import { DogProfile, DogProfileInput } from '@/types/dog-profile';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Plus, Trash2 } from 'lucide-react';

interface DogProfileListProps {
  profiles: DogProfile[];
  onCreateProfile: (profile: DogProfileInput) => void;
  onUpdateProfile: (id: string, profile: DogProfileInput) => void;
  onDeleteProfile: (id: string) => void;
}

export function DogProfileList({
  profiles,
  onCreateProfile,
  onUpdateProfile,
  onDeleteProfile,
}: DogProfileListProps) {
  const [formData, setFormData] = useState<DogProfileInput>({
    name: '',
    breed: '',
    weight: 0,
    age: 0,
    healthIssues: [],
    dietaryRestrictions: [],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const profileData: DogProfileInput = {
      ...formData,
      healthIssues: formData.healthIssues.filter(issue => issue.trim() !== ''),
      dietaryRestrictions: formData.dietaryRestrictions.filter(restriction => restriction.trim() !== ''),
    };
    onCreateProfile(profileData);
    setFormData({
      name: '',
      breed: '',
      weight: 0,
      age: 0,
      healthIssues: [],
      dietaryRestrictions: [],
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'healthIssues' || name === 'dietaryRestrictions') {
      setFormData(prev => ({
        ...prev,
        [name]: value.split(',').map(item => item.trim()),
      }));
    } else if (name === 'weight' || name === 'age') {
      setFormData(prev => ({
        ...prev,
        [name]: parseFloat(value) || 0,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  return (
    <div className="space-y-4">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Add Dog Profile
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Dog Profile</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="breed">Breed</Label>
              <Input
                id="breed"
                name="breed"
                value={formData.breed}
                onChange={handleChange}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (lbs)</Label>
                <Input
                  id="weight"
                  name="weight"
                  type="number"
                  value={formData.weight}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Age (years)</Label>
                <Input
                  id="age"
                  name="age"
                  type="number"
                  value={formData.age}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="healthIssues">Health Issues (comma-separated)</Label>
              <Textarea
                id="healthIssues"
                name="healthIssues"
                value={formData.healthIssues.join(', ')}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dietaryRestrictions">Dietary Restrictions (comma-separated)</Label>
              <Textarea
                id="dietaryRestrictions"
                name="dietaryRestrictions"
                value={formData.dietaryRestrictions.join(', ')}
                onChange={handleChange}
              />
            </div>
            <Button type="submit">Create Profile</Button>
          </form>
        </DialogContent>
      </Dialog>

      {profiles.map((profile) => (
        <Card key={profile.id}>
          <CardHeader>
            <CardTitle>{profile.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Breed:</strong> {profile.breed}</p>
              <p><strong>Weight:</strong> {profile.weight} lbs</p>
              <p><strong>Age:</strong> {profile.age} years</p>
              {profile.healthIssues.length > 0 && (
                <p><strong>Health Issues:</strong> {profile.healthIssues.join(', ')}</p>
              )}
              {profile.dietaryRestrictions.length > 0 && (
                <p><strong>Dietary Restrictions:</strong> {profile.dietaryRestrictions.join(', ')}</p>
              )}
            </div>
            <div className="mt-4 flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDeleteProfile(profile.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 