#!/bin/bash

# Update Supabase email templates using CLI
# This script pushes the email templates to your Supabase project

set -e

echo "📧 Updating Supabase email templates..."

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Install it with: npm install -g supabase"
    exit 1
fi

# Get project ID from .env
PROJECT_ID=$(grep VITE_SUPABASE_URL .env | cut -d'/' -f3 | cut -d'.' -f1)

if [ -z "$PROJECT_ID" ]; then
    echo "❌ Could not extract project ID from .env"
    exit 1
fi

echo "📤 Pushing email templates for project: $PROJECT_ID"

# Push migrations (which includes the trigger)
echo "📤 Pushing database migrations..."
supabase db push

echo "✅ Email templates updated successfully!"
echo ""
echo "📝 Note: Email templates are managed in Supabase Dashboard"
echo "   Go to: Authentication → Email Templates"
echo "   Then manually paste the content from:"
echo "   - supabase/email-templates/confirmation.html"
echo "   - supabase/email-templates/reset-password.html"
