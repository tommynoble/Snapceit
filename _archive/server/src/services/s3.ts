import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Multer } from 'express';

class S3Service {
    private client: S3Client;
    private bucket: string;

    constructor() {
        this.client = new S3Client({
            region: process.env.AWS_REGION,
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            },
        });
        this.bucket = process.env.AWS_S3_BUCKET || '';
    }

    async uploadReceipt(file: Multer.File, userId: string): Promise<{ bucket: string; key: string }> {
        try {
            const key = `receipts/${userId}/${Date.now()}-${file.originalname}`;
            
            const command = new PutObjectCommand({
                Bucket: this.bucket,
                Key: key,
                Body: file.buffer,
                ContentType: file.mimetype,
            });

            await this.client.send(command);
            return { bucket: this.bucket, key };
        } catch (err) {
            const error = err as Error;
            console.error('S3 Upload Error:', error);
            throw new Error(`Failed to upload receipt: ${error.message}`);
        }
    }

    async getSignedUrl(key: string): Promise<string> {
        try {
            const command = new GetObjectCommand({
                Bucket: this.bucket,
                Key: key,
            });

            const url = await getSignedUrl(this.client, command, { expiresIn: 3600 });
            return url;
        } catch (err) {
            const error = err as Error;
            console.error('S3 GetSignedUrl Error:', error);
            throw new Error(`Failed to get signed URL: ${error.message}`);
        }
    }

    async deleteFile(key: string): Promise<void> {
        try {
            const command = new DeleteObjectCommand({
                Bucket: this.bucket,
                Key: key,
            });

            await this.client.send(command);
        } catch (err) {
            const error = err as Error;
            console.error('S3 Delete Error:', error);
            throw new Error(`Failed to delete file: ${error.message}`);
        }
    }
}

export default new S3Service();
