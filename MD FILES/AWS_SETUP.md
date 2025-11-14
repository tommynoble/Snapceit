# 🔑 AWS Setup Guide

## ✅ AWS CLI Installed

```
aws-cli/2.31.33 Python/3.13.9 Darwin/25.1.0 source/arm64
```

---

## 📋 **Step 1: Get AWS Credentials**

1. Go to **AWS Console** → https://console.aws.amazon.com
2. Click your account name (top right) → **Security credentials**
3. Go to **Access keys** section
4. Click **Create access key**
5. Select **Command Line Interface (CLI)**
6. Copy:
   - **Access Key ID**
   - **Secret Access Key**

⚠️ **IMPORTANT:** Save these securely! You won't see the secret key again.

---

## 🔧 **Step 2: Configure AWS CLI**

Run this command:

```bash
aws configure
```

When prompted, enter:

```
AWS Access Key ID [None]: YOUR_ACCESS_KEY_ID
AWS Secret Access Key [None]: YOUR_SECRET_ACCESS_KEY
Default region name [None]: us-east-1
Default output format [None]: json
```

---

## ✅ **Step 3: Verify Configuration**

```bash
aws sts get-caller-identity
```

Expected output:
```json
{
    "UserId": "AIDAI...",
    "Account": "123456789012",
    "Arn": "arn:aws:iam::123456789012:user/your-username"
}
```

---

## 🚀 **Step 4: Deploy Lambda**

Once credentials are configured, run:

```bash
cd /Users/thomasasante/Documents/CODING/Snapceit-main

# Install Lambda dependencies
cd lambda
npm install
cd ..

# Deploy Lambda function
aws lambda create-function \
  --function-name textract-supabase \
  --runtime nodejs18.x \
  --role arn:aws:iam::YOUR-ACCOUNT-ID:role/lambda-textract-role \
  --handler textract-supabase.handler \
  --zip-file fileb://lambda-deployment.zip \
  --timeout 60 \
  --memory-size 512 \
  --environment Variables={SUPABASE_URL=https://yoqpzwqlmdhaapnaufrm.supabase.co,SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY,AWS_REGION=us-east-1}
```

---

## 📝 **What You Need**

Before deploying, gather:

1. **AWS Account ID**
   ```bash
   aws sts get-caller-identity --query Account --output text
   ```

2. **Supabase Service Role Key**
   - Go to Supabase Dashboard
   - Settings → API
   - Copy **Service Role Key** (NOT anon key)

3. **Lambda Execution Role ARN**
   - Go to AWS IAM → Roles
   - Create role with Textract + S3 permissions
   - Copy the ARN

---

## 🎯 **Next Steps**

1. Run `aws configure` with your credentials
2. Verify with `aws sts get-caller-identity`
3. Follow `DEPLOYMENT_GUIDE.md` for Lambda deployment

---

**Ready? Run:**
```bash
aws configure
```

Then let me know when credentials are set up! 🚀
