# Supabase Email Templates Setup Guide

## Overview
This guide explains how to apply the custom email templates to your Supabase project. The templates match your Snapceit brand with the purple gradient design and logo.

## Templates Created

1. **confirmation.html** - Email verification template
2. **reset-password.html** - Password reset template

Both templates feature:
- ✅ Snapceit logo (SVG embedded)
- ✅ Purple gradient design matching your homepage
- ✅ Professional, responsive layout
- ✅ Security notes and helpful information
- ✅ Mobile-friendly design

## How to Apply Templates

### Step 1: Access Supabase Dashboard
1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Select your project
3. Navigate to **Authentication** → **Email Templates**

### Step 2: Update Confirmation Email Template

1. Click on **Confirm signup** template
2. Click **Edit** button
3. Replace the entire HTML with the content from `confirmation.html`
4. Click **Save**

**Template Variables Used:**
- `{{ .ConfirmationURL }}` - The email confirmation link (auto-filled by Supabase)

### Step 3: Update Password Reset Email Template

1. Click on **Reset password** template
2. Click **Edit** button
3. Replace the entire HTML with the content from `reset-password.html`
4. Click **Save**

**Template Variables Used:**
- `{{ .RecoveryURL }}` - The password reset link (auto-filled by Supabase)

### Step 4: Test Templates

1. Go to **Authentication** → **Users**
2. Create a test user or use an existing one
3. Send a test confirmation email:
   - Click the user's menu (three dots)
   - Select **Send confirmation link**
4. Check your email inbox to verify the template looks correct

## Template Variables Reference

Supabase provides these variables that are automatically filled in:

| Variable | Description | Used In |
|----------|-------------|---------|
| `{{ .ConfirmationURL }}` | Email confirmation link | Confirmation template |
| `{{ .RecoveryURL }}` | Password reset link | Reset password template |
| `{{ .Email }}` | User's email address | Both templates |
| `{{ .Data }}` | Custom metadata (if any) | Both templates |

## Customization Tips

### Change Colors
The templates use these color values:
- **Primary Purple**: `#D444EF`
- **Secondary Purple**: `#AF3AEB`
- **Tertiary Purple**: `#7c3aed`
- **Gradient**: `linear-gradient(135deg, #D444EF 0%, #AF3AEB 50%, #7c3aed 100%)`

To change colors, find and replace these hex values in the HTML.

### Update Links
The footer contains these links - update them to match your actual URLs:
- `https://snapceit.com` - Main website
- `https://snapceit.com/privacy` - Privacy policy
- `https://snapceit.com/terms` - Terms of service

### Add Company Info
Update the footer text:
- Company name
- Copyright year
- Company description

## Email Delivery Settings

### Configure SMTP (Optional)
If you want to use a custom email provider instead of Supabase's default:

1. Go to **Authentication** → **Providers**
2. Scroll to **Email**
3. Enable **Custom SMTP**
4. Enter your SMTP credentials

### Rate Limiting
Supabase has built-in rate limiting for emails:
- Confirmation emails: 1 per minute per email
- Password reset: 1 per minute per email

## Troubleshooting

### Template Not Updating
- Clear browser cache (Cmd+Shift+R on Mac)
- Wait 1-2 minutes for changes to propagate
- Try in an incognito/private window

### Variables Not Showing
- Ensure you're using exact variable names: `{{ .VariableName }}`
- Check for typos in variable names
- Variables are case-sensitive

### Email Not Received
- Check spam/junk folder
- Verify email address is correct
- Check Supabase logs: **Authentication** → **Logs**
- Ensure SMTP is configured if using custom provider

### Styling Issues
- Some email clients strip CSS - use inline styles (already done in templates)
- Test in multiple email clients (Gmail, Outlook, Apple Mail)
- Use [Litmus](https://litmus.com) or [Email on Acid](https://www.emailonacid.com) for testing

## Best Practices

1. **Always test** - Send test emails before going live
2. **Mobile first** - Templates are responsive, but verify on mobile
3. **Keep it simple** - Avoid complex CSS or JavaScript
4. **Use inline styles** - Email clients don't support external stylesheets
5. **Test links** - Verify all links work correctly
6. **Monitor delivery** - Check Supabase logs for bounce rates

## Additional Resources

- [Supabase Email Templates Docs](https://supabase.com/docs/guides/auth/auth-email)
- [Email Template Variables](https://supabase.com/docs/guides/auth/auth-email#email-templates)
- [MJML Email Framework](https://mjml.io) - For more complex templates

## Support

If you encounter issues:
1. Check Supabase status page
2. Review authentication logs
3. Test with a simple template first
4. Contact Supabase support if needed
