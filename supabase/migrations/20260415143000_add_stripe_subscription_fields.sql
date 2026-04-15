ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_status TEXT NOT NULL DEFAULT 'inactive';

CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id
ON public.profiles(stripe_customer_id);

UPDATE public.profiles
SET subscription_status = CASE
  WHEN subscription_active = true THEN 'active'
  ELSE 'inactive'
END
WHERE subscription_status IS NULL OR subscription_status = '';
