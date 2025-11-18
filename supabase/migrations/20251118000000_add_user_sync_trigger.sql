-- Create trigger to sync confirmed users to public.users table
-- This ensures only verified emails are added to the database

-- First, add email_verified column if it doesn't exist
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;

-- Create function to sync user on auth confirmation
CREATE OR REPLACE FUNCTION public.handle_new_user_confirmed()
RETURNS TRIGGER AS $$
BEGIN
  -- Only insert/update when email is confirmed
  IF NEW.email_confirmed_at IS NOT NULL THEN
    INSERT INTO public.users (id, email, email_verified, created_at, updated_at)
    VALUES (NEW.id, NEW.email, true, NEW.created_at, NOW())
    ON CONFLICT (id) DO UPDATE
    SET email_verified = true, updated_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_confirmed ON auth.users;

-- Create trigger on auth.users table
CREATE TRIGGER on_auth_user_confirmed
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (OLD.email_confirmed_at IS DISTINCT FROM NEW.email_confirmed_at)
  EXECUTE FUNCTION public.handle_new_user_confirmed();

-- Also handle new signups (insert unconfirmed initially)
CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert user with email_verified = false initially
  INSERT INTO public.users (id, email, email_verified, created_at, updated_at)
  VALUES (NEW.id, NEW.email, false, NEW.created_at, NOW())
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_signup();
