# How to Apply Email Templates to Supabase

Since the Supabase email template API is restricted, follow these manual steps:

## Step 1: Copy Confirmation Template
1. Open `/supabase/email-templates/confirmation.html`
2. Copy all the content
3. Go to **Supabase Dashboard** → **Authentication** → **Email Templates**
4. Click on **"Confirm signup"** template
5. Paste the content and save

## Step 2: Copy Reset Password Template
1. Open `/supabase/email-templates/reset-password.html`
2. Copy all the content
3. Go to **Supabase Dashboard** → **Authentication** → **Email Templates**
4. Click on **"Reset password"** template
5. Paste the content and save

## Done!
Your email templates are now updated in Supabase. They will use the redirect URL configured in `src/auth/SupabaseAuthContext.tsx` (currently set to `http://localhost:5184/email-confirmed` for testing).
