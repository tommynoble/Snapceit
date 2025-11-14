#!/bin/bash

# Fix Receipt Upload - Complete Script
# This script will:
# 1. Disable RLS on receipts table
# 2. Test receipt upload

echo "🔧 Receipt Upload Fix Script"
echo "============================"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
  echo "❌ .env file not found"
  exit 1
fi

# Load environment variables
export $(cat .env | grep -v '#' | xargs)

echo "📋 Step 1: Disable RLS on receipts table"
echo "----------------------------------------"
echo ""
echo "You need to manually run this SQL in Supabase SQL Editor:"
echo ""
echo "ALTER TABLE public.receipts DISABLE ROW LEVEL SECURITY;"
echo ""
echo "Then come back and run: node test-receipt-upload.js"
echo ""
echo "Or if you have curl and your Supabase service key, run:"
echo ""
echo "curl -X POST https://your-project.supabase.co/rest/v1/rpc/exec_sql \\"
echo "  -H 'Authorization: Bearer YOUR_SERVICE_KEY' \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"sql\": \"ALTER TABLE public.receipts DISABLE ROW LEVEL SECURITY;\"}'"
echo ""
