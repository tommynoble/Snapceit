# Avatar Bucket Setup Guide

## Overview
The Profile page now supports user profile picture uploads. Pictures are stored in Supabase Storage in the `avatars` bucket.

## What Was Created

### 1. Migration File
**File:** `supabase/migrations/20251113000000_create_avatars_bucket.sql`

Creates:
- ✅ `avatars` bucket (public)
- ✅ RLS policies for secure access
- ✅ Users can only upload/update/delete their own avatars

### 2. Profile Picture Features
**File:** `src/pages/dashboard/Profile.tsx`

Features:
- ✅ Upload profile picture by hovering and clicking
- ✅ Shows initials if no picture uploaded
- ✅ Remove picture button (red X)
- ✅ Stores URL in `user_metadata.avatar_url`
- ✅ Unique per user

## Deployment Steps

### Step 1: Deploy Migration
```bash
cd /Users/thomasasante/Documents/CODING/Snapceit-main
supabase db push
```

This will:
- Create the `avatars` bucket
- Set up RLS policies
- Enable public read access

### Step 2: Verify Bucket Creation
Go to Supabase Dashboard:
1. Navigate to Storage
2. Confirm `avatars` bucket exists
3. Check it's marked as public

### Step 3: Test Upload
1. Go to Profile page (`/dashboard/profile`)
2. Hover over avatar (initials)
3. Click to upload image
4. Confirm it appears and persists

## Bucket Details

**Bucket Name:** `avatars`
**Public:** Yes (anyone can view, only owner can upload)
**Storage Path:** `avatars/{user-id}-{timestamp}.jpg`
**Database Field:** `user_metadata.avatar_url`

## RLS Policies

| Action | Who | Condition |
|--------|-----|-----------|
| SELECT | Anyone | bucket_id = 'avatars' |
| INSERT | User | Own user_id in path |
| UPDATE | User | Own user_id in path |
| DELETE | User | Own user_id in path |

## Error Troubleshooting

### "Bucket not found"
- Run migration: `supabase db push`
- Check Supabase dashboard Storage section

### "Permission denied"
- Ensure user is logged in
- Check RLS policies are applied
- Verify `user_metadata.avatar_url` is being set

### Image not persisting
- Check browser console for errors
- Verify Supabase auth token is valid
- Check user_metadata is being updated

## File Structure
```
supabase/
├── migrations/
│   └── 20251113000000_create_avatars_bucket.sql
src/
└── pages/
    └── dashboard/
        └── Profile.tsx
```

## Next Steps
1. Deploy migration
2. Test profile picture upload
3. Verify images persist across sessions
4. Monitor storage usage
