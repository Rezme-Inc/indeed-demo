-- Add file upload fields to employment table
ALTER TABLE employment 
ADD COLUMN file_url TEXT,
ADD COLUMN file_name TEXT,
ADD COLUMN file_size BIGINT; 