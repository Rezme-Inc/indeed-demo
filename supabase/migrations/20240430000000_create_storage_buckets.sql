-- Create storage buckets for restorative record file uploads
-- This migration creates all the necessary storage buckets for file attachments

-- Create award files bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'award-files',
    'award-files', 
    true,
    26214400, -- 25MB in bytes
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']
) ON CONFLICT (id) DO NOTHING;

-- Create skill files bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'skill-files',
    'skill-files',
    true,
    26214400, -- 25MB in bytes
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']
) ON CONFLICT (id) DO NOTHING;

-- Create community engagement files bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'community-engagement-files',
    'community-engagement-files',
    true,
    26214400, -- 25MB in bytes
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']
) ON CONFLICT (id) DO NOTHING;

-- Create rehab program files bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'rehab-program-files',
    'rehab-program-files',
    true,
    26214400, -- 25MB in bytes
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']
) ON CONFLICT (id) DO NOTHING;

-- Create microcredential files bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'microcredential-files',
    'microcredential-files',
    true,
    26214400, -- 25MB in bytes
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']
) ON CONFLICT (id) DO NOTHING;

-- Create education files bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'education-files',
    'education-files',
    true,
    26214400, -- 25MB in bytes
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']
) ON CONFLICT (id) DO NOTHING;

-- Create hobby files bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'hobby-files',
    'hobby-files',
    true,
    26214400, -- 25MB in bytes
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']
) ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for all buckets
-- These policies allow authenticated users to upload, view, and manage their own files

-- Award files policies
CREATE POLICY "Users can upload award files" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'award-files' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view award files" ON storage.objects
FOR SELECT USING (
    bucket_id = 'award-files' 
    AND (
        auth.uid()::text = (storage.foldername(name))[1]
        OR true -- Allow public read for sharing
    )
);

CREATE POLICY "Users can update their award files" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'award-files'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their award files" ON storage.objects
FOR DELETE USING (
    bucket_id = 'award-files'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Skill files policies
CREATE POLICY "Users can upload skill files" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'skill-files' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view skill files" ON storage.objects
FOR SELECT USING (
    bucket_id = 'skill-files' 
    AND (
        auth.uid()::text = (storage.foldername(name))[1]
        OR true -- Allow public read for sharing
    )
);

CREATE POLICY "Users can update their skill files" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'skill-files'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their skill files" ON storage.objects
FOR DELETE USING (
    bucket_id = 'skill-files'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Community engagement files policies
CREATE POLICY "Users can upload community engagement files" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'community-engagement-files' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view community engagement files" ON storage.objects
FOR SELECT USING (
    bucket_id = 'community-engagement-files' 
    AND (
        auth.uid()::text = (storage.foldername(name))[1]
        OR true -- Allow public read for sharing
    )
);

CREATE POLICY "Users can update their community engagement files" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'community-engagement-files'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their community engagement files" ON storage.objects
FOR DELETE USING (
    bucket_id = 'community-engagement-files'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Rehab program files policies
CREATE POLICY "Users can upload rehab program files" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'rehab-program-files' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view rehab program files" ON storage.objects
FOR SELECT USING (
    bucket_id = 'rehab-program-files' 
    AND (
        auth.uid()::text = (storage.foldername(name))[1]
        OR true -- Allow public read for sharing
    )
);

CREATE POLICY "Users can update their rehab program files" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'rehab-program-files'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their rehab program files" ON storage.objects
FOR DELETE USING (
    bucket_id = 'rehab-program-files'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Microcredential files policies
CREATE POLICY "Users can upload microcredential files" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'microcredential-files' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view microcredential files" ON storage.objects
FOR SELECT USING (
    bucket_id = 'microcredential-files' 
    AND (
        auth.uid()::text = (storage.foldername(name))[1]
        OR true -- Allow public read for sharing
    )
);

CREATE POLICY "Users can update their microcredential files" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'microcredential-files'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their microcredential files" ON storage.objects
FOR DELETE USING (
    bucket_id = 'microcredential-files'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Education files policies
CREATE POLICY "Users can upload education files" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'education-files' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view education files" ON storage.objects
FOR SELECT USING (
    bucket_id = 'education-files' 
    AND (
        auth.uid()::text = (storage.foldername(name))[1]
        OR true -- Allow public read for sharing
    )
);

CREATE POLICY "Users can update their education files" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'education-files'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their education files" ON storage.objects
FOR DELETE USING (
    bucket_id = 'education-files'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Hobby files policies
CREATE POLICY "Users can upload hobby files" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'hobby-files' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view hobby files" ON storage.objects
FOR SELECT USING (
    bucket_id = 'hobby-files' 
    AND (
        auth.uid()::text = (storage.foldername(name))[1]
        OR true -- Allow public read for sharing
    )
);

CREATE POLICY "Users can update their hobby files" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'hobby-files'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their hobby files" ON storage.objects
FOR DELETE USING (
    bucket_id = 'hobby-files'
    AND auth.uid()::text = (storage.foldername(name))[1]
); 