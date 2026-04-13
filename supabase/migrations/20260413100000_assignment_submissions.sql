-- Assignment submissions for inline course assignments
CREATE TABLE IF NOT EXISTS assignment_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  product_id text NOT NULL,
  item_id text NOT NULL,
  submission_text text,
  file_url text,
  file_name text,
  submitted_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE assignment_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY assignment_submissions_owner ON assignment_submissions
  FOR ALL USING (auth.uid() = user_id);

-- Storage bucket for assignment file uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('assignment-files', 'assignment-files', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policy: users can upload to their own folder
CREATE POLICY assignment_files_upload ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'assignment-files'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Storage policy: anyone can read (public bucket)
CREATE POLICY assignment_files_read ON storage.objects
  FOR SELECT USING (bucket_id = 'assignment-files');
