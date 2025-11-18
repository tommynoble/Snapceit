# How to Apply Email Templates to Supabase

The Supabase email template API requires special JWT formatting. For now, follow these manual steps (one-time setup):

## Step 1: Copy Confirmation Template
1. Open `/supabase/email-templates/confirmation.html` in your IDE
2. Select all content (Cmd+A) and copy
3. Go to **Supabase Dashboard** → **Authentication** → **Email Templates**
4. Click on **"Confirm signup"** template
5. Clear the existing content and paste your HTML
6. Click **Save**

## Step 2: Copy Reset Password Template
1. Open `/supabase/email-templates/reset-password.html` in your IDE
2. Select all content (Cmd+A) and copy
3. Go to **Supabase Dashboard** → **Authentication** → **Email Templates**
4. Click on **"Reset password"** template
5. Clear the existing content and paste your HTML
6. Click **Save**

## Done!
Your email templates are now updated in Supabase. They will use the redirect URL configured in `src/auth/SupabaseAuthContext.tsx`:
- **Testing**: `http://localhost:5184/email-confirmed`
- **Production**: `https://snapceit.com/email-confirmed`

## Features
- ✅ Snapceit logo with cyan-blue gradient
- ✅ Manrope font
- ✅ Professional purple gradient header
- ✅ Responsive design
- ✅ Mobile-friendly
