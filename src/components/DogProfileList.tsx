import React, { useState, useEffect } from 'react';
import { DogProfile } from '@/types/dog-profile';
import { getAllProfiles, createDogProfile, updateDogProfile, deleteDogProfile } from '@/lib/services/dogProfile.service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Pencil, Trash2 } from 'lucide-react';

export function DogProfileList() {
  const [profiles, setProfiles] = useState<DogProfile[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<DogProfile | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    breed: '',
    weight: '',
    vet_issues: '',
    dietary_restrictions: '',
  });

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    const loadedProfiles = await getAllProfiles();
    setProfiles(loadedProfiles);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProfile) {
      await updateDogProfile(editingProfile.id, formData);
    } else {
      await createDogProfile(formData);
    }
    setIsFormOpen(false);
    setEditingProfile(null);
    resetForm();
    loadProfiles();
  };

  const handleEdit = (profile: DogProfile) => {
    setEditingProfile(profile);
    setFormData({
      name: profile.name,
      breed: profile.breed,
      weight: profile.weight.toString(),
      vet_issues: profile.vet_issues || '',
      dietary_restrictions: profile.dietary_restrictions || '',
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this profile?')) {
      await deleteDogProfile(id);
      loadProfiles();
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      breed: '',
      weight: '',
      vet_issues: '',
      dietary_restrictions: '',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Dog Profiles</h2>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingProfile(null);
              resetForm();
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Profile
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingProfile ? 'Edit Profile' : 'Add New Profile'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="breed">Breed</Label>
                <Input
                  id="breed"
                  value={formData.breed}
                  onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vet_issues">Vet Issues</Label>
                <Textarea
                  id="vet_issues"
                  value={formData.vet_issues}
                  onChange={(e) => setFormData({ ...formData, vet_issues: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dietary_restrictions">Dietary Restrictions</Label>
                <Textarea
                  id="dietary_restrictions"
                  value={formData.dietary_restrictions}
                  onChange={(e) => setFormData({ ...formData, dietary_restrictions: e.target.value })}
                />
              </div>
              <Button type="submit" className="w-full">
                {editingProfile ? 'Update Profile' : 'Create Profile'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {profiles.map((profile) => (
          <Card key={profile.id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>{profile.name}</span>
                <div className="space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(profile)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(profile.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Breed:</strong> {profile.breed}</p>
                <p><strong>Weight:</strong> {profile.weight} kg</p>
                {profile.vet_issues && (
                  <p><strong>Vet Issues:</strong> {profile.vet_issues}</p>
                )}
                {profile.dietary_restrictions && (
                  <p><strong>Dietary Restrictions:</strong> {profile.dietary_restrictions}</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 