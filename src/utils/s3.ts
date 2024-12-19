import { 
  S3Client, 
  PutObjectCommand, 
  CreateBucketCommand, 
  HeadBucketCommand, 
  PutBucketPolicyCommand,
  PutBucketCorsCommand 
} from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: import.meta.env.VITE_AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID || '',
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY || '',
  },
  endpoint: import.meta.env.VITE_AWS_ENDPOINT,
  forcePathStyle: true,
});

const BUCKET_NAME = 'snapceit';

// Function to ensure bucket exists with correct permissions
const ensureBucketExists = async () => {
  try {
    // Check if bucket exists
    try {
      await s3Client.send(new HeadBucketCommand({ Bucket: BUCKET_NAME }));
      console.log('Bucket exists:', BUCKET_NAME);
      return; // Bucket exists
    } catch (error) {
      console.log('Creating new bucket:', BUCKET_NAME);
      // Bucket doesn't exist, create it
      await s3Client.send(new CreateBucketCommand({ 
        Bucket: BUCKET_NAME
      }));

      // Set bucket policy to allow public read
      const bucketPolicy = {
        Version: '2012-10-17',
        Statement: [
          {
            Sid: 'PublicRead',
            Effect: 'Allow',
            Principal: '*',
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${BUCKET_NAME}/*`]
          }
        ]
      };

      // Set bucket policy
      await s3Client.send(new PutBucketPolicyCommand({
        Bucket: BUCKET_NAME,
        Policy: JSON.stringify(bucketPolicy)
      }));

      // Set CORS configuration
      const corsConfig = {
        CORSRules: [
          {
            AllowedHeaders: ["*"],
            AllowedMethods: ["PUT", "POST", "GET", "HEAD"],
            AllowedOrigins: [
              "http://localhost:5173",
              "http://localhost:5174",
              "http://localhost:5175",
              "http://localhost:*"
            ],
            ExposeHeaders: ["ETag"]
          }
        ]
      };

      await s3Client.send(new PutBucketCorsCommand({
        Bucket: BUCKET_NAME,
        CORSConfiguration: corsConfig
      }));

      console.log('Created bucket with CORS configuration:', BUCKET_NAME);
    }
  } catch (error) {
    console.error('Error ensuring bucket exists:', error);
    throw error;
  }
};

export const uploadToS3 = async (
  file: File | Blob, 
  key: string,
  onProgress?: (progress: number) => void
): Promise<{ url: string; key: string }> => {
  try {
    await ensureBucketExists();

    // Validate file
    if (!file) {
      throw new Error('No file provided');
    }

    // Convert File/Blob to Uint8Array
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Prepare the upload command
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: uint8Array,
      ContentType: file instanceof File ? file.type : 'application/json'
    });

    // Attempt the upload
    await s3Client.send(command);
    
    // Call progress callback if provided
    if (onProgress) {
      onProgress(100);
    }
    
    // Return both the URL and key
    const endpoint = import.meta.env.VITE_AWS_ENDPOINT;
    const url = endpoint 
      ? `${endpoint}/${BUCKET_NAME}/${key}`
      : `https://${BUCKET_NAME}.s3.${import.meta.env.VITE_AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`;

    return { url, key };
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw new Error('Upload failed: ' + (error as Error).message);
  }
};
