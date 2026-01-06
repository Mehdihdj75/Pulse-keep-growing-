-- Add a JSONB column to store the full diagnostic report structure
ALTER TABLE public.diagnostics 
ADD COLUMN IF NOT EXISTS report_data JSONB;

-- Update RLS to ensure users can read their own report data
-- (Existing policies might already cover this, but good to ensure)
