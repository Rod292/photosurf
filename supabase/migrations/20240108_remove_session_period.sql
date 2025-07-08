-- Remove session_period column from galleries table as it's no longer needed
-- Collections are now created separately with explicit names like "Matin 8 juillet"

ALTER TABLE public.galleries DROP COLUMN IF EXISTS session_period;