import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

class S3Service {
    constructor() {
        this.client = new S3Client({
            region: process.env.AWS_REGION,
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            },
        });
        this.bucket = process.env.AWS_S3_BUCKET;
    }

    async uploadReceipt(file, userId) {
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
        } catch (error) {
            console.error('S3 Upload Error:', error);
            throw new Error(`Failed to upload receipt: ${error.message}`);
        }
    }

    async getSignedUrl(key) {
        try {
            const command = new GetObjectCommand({
                Bucket: this.bucket,
                Key: key,
            });

            const url = await getSignedUrl(this.client, command, { expiresIn: 3600 });
            return url;
        } catch (error) {
            console.error('S3 GetSignedUrl Error:', error);
            throw new Error(`Failed to get signed URL: ${error.message}`);
        }
    }

    async deleteFile(key) {
        try {
            const command = new DeleteObjectCommand({
                Bucket: this.bucket,
                Key: key,
            });

            await this.client.send(command);
        } catch (error) {
            console.error('S3 Delete Error:', error);
            throw new Error(`Failed to delete file: ${error.message}`);
        }
    }
}

export default new S3Service();
