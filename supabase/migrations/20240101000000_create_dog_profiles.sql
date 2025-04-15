-- Create dog_profiles table
CREATE TABLE IF NOT EXISTS dog_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  breed TEXT NOT NULL,
  weight INTEGER NOT NULL,
  vet_issues TEXT,
  dietary_restrictions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_dog_profiles_user_id ON dog_profiles(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE dog_profiles ENABLE ROW LEVEL SECURITY;

-- Create a single policy for all operations
CREATE POLICY "Users can access their own dog profiles"
  ON dog_profiles
  FOR ALL
  USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_dog_profiles_updated_at
  BEFORE UPDATE ON dog_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column(); 