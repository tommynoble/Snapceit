import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: import.meta.env.VITE_AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY,
  },
});

const BUCKET_NAME = 'snapceit';

export const uploadToS3 = async (
  file: File, 
  userId: string,
  onProgress?: (progress: number) => void
): Promise<string> => {
  try {
    // Validate file
    if (!file) {
      throw new Error('No file provided');
    }

    // Clean the filename and ensure safe extension
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileExtension = originalName.split('.').pop()?.toLowerCase() || 'jpg';
    const timestamp = Date.now();
    const key = `receipts/${userId}/${timestamp}_${Math.random().toString(36).substring(7)}.${fileExtension}`;

    // Prepare the upload command
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: file,
      ContentType: file.type || 'application/octet-stream',
      Metadata: {
        'original-name': originalName,
        'upload-date': new Date().toISOString(),
        'user-id': userId,
      },
    });

    // Attempt the upload
    try {
      await s3Client.send(command);
      
      // Call progress callback if provided
      if (onProgress) {
        onProgress(100);
      }
      
      // Return the S3 URL
      return `https://${BUCKET_NAME}.s3.${import.meta.env.VITE_AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`;
    } catch (uploadError) {
      console.error('S3 Upload Error:', uploadError);
      if (uploadError instanceof Error) {
        // Check for specific AWS errors
        if (uploadError.message.includes('InvalidAccessKeyId')) {
          throw new Error('Invalid AWS credentials. Please check your access key.');
        } else if (uploadError.message.includes('SignatureDoesNotMatch')) {
          throw new Error('Invalid AWS credentials. Please check your secret key.');
        } else if (uploadError.message.includes('NoSuchBucket')) {
          throw new Error('S3 bucket not found. Please check your bucket configuration.');
        }
        throw new Error(`Upload failed: ${uploadError.message}`);
      }
      throw new Error('Upload failed. Please try again.');
    }
  } catch (error) {
    console.error('Error in uploadToS3:', error);
    if (error instanceof Error) {
      throw new Error(`Upload failed: ${error.message}`);
    }
    throw new Error('Upload failed due to an unknown error.');
  }
};
