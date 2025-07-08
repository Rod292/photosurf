-- Update session_period constraint to use 'midi' instead of 'journee' and fix accent issues
ALTER TABLE public.galleries DROP CONSTRAINT IF EXISTS galleries_session_period_check;
ALTER TABLE public.galleries ADD CONSTRAINT galleries_session_period_check 
CHECK (session_period IN ('matin', 'apres-midi', 'midi'));

-- Update any existing 'journee' values to 'midi'
UPDATE public.galleries SET session_period = 'midi' WHERE session_period = 'journee';
UPDATE public.galleries SET session_period = 'midi' WHERE session_period = 'journée';