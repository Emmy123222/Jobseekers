/*
  # Create applications table for job tracking

  1. New Tables
    - `applications`
      - `id` (uuid, primary key)
      - `job_title` (text, required)
      - `company` (text, required)
      - `applied_date` (timestamptz, default now)
      - `status` (text, default 'applied')
      - `job_url` (text, optional)
      - `cover_letter` (text, optional)
      - `notes` (text, optional)
      - `created_at` (timestamptz, default now)
      - `updated_at` (timestamptz, default now)

  2. Security
    - Enable RLS on `applications` table
    - Add policies for public access (since no auth system yet)

  3. Indexes
    - Index on applied_date for sorting
    - Index on status for filtering
*/

CREATE TABLE IF NOT EXISTS applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_title text NOT NULL,
  company text NOT NULL,
  applied_date timestamptz DEFAULT now(),
  status text DEFAULT 'applied' CHECK (status IN ('applied', 'cover_letter_generated', 'company_viewed', 'interviewed', 'rejected', 'accepted')),
  job_url text,
  cover_letter text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (no authentication required)
CREATE POLICY "Allow public read access"
  ON applications
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert access"
  ON applications
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update access"
  ON applications
  FOR UPDATE
  TO public
  USING (true);

CREATE POLICY "Allow public delete access"
  ON applications
  FOR DELETE
  TO public
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_applications_applied_date ON applications(applied_date DESC);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_company ON applications(company);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();