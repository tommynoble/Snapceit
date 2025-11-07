const { TextractClient, AnalyzeExpenseCommand } = require("@aws-sdk/client-textract");
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const { DynamoDBClient, PutItemCommand } = require("@aws-sdk/client-dynamodb");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const textractClient = new TextractClient({ region: "us-east-1" });
const s3Client = new S3Client({ region: "us-east-1" });
const dynamoClient = new DynamoDBClient({ region: "us-east-1" });

const streamToBuffer = async (stream) => {
    const chunks = [];
    for await (const chunk of stream) {
        chunks.push(chunk);
    }
    return Buffer.concat(chunks);
};

const processTextractResponse = (response) => {
    const data = {
        merchantName: "",
        total: 0,
        date: "",
        items: []
    };

    // Process expense fields
    for (const document of response.ExpenseDocuments || []) {
        // Get merchant name
        const merchantField = document.SummaryFields?.find(
            field => field.Type?.Text === "VENDOR"
        );
        if (merchantField?.ValueDetection?.Text) {
            data.merchantName = merchantField.ValueDetection.Text;
        }

        // Get total amount
        const totalField = document.SummaryFields?.find(
            field => field.Type?.Text === "TOTAL"
        );
        if (totalField?.ValueDetection?.Text) {
            data.total = parseFloat(totalField.ValueDetection.Text.replace(/[^0-9.]/g, '')) || 0;
        }

        // Get date
        const dateField = document.SummaryFields?.find(
            field => field.Type?.Text === "INVOICE_RECEIPT_DATE"
        );
        if (dateField?.ValueDetection?.Text) {
            data.date = dateField.ValueDetection.Text;
        }

        // Get line items
        for (const lineItem of document.LineItemGroups?.[0]?.LineItems || []) {
            const item = {
                description: "",
                price: 0
            };

            for (const field of lineItem.LineItemExpenseFields || []) {
                if (field.Type?.Text === "ITEM") {
                    item.description = field.ValueDetection?.Text || "";
                } else if (field.Type?.Text === "PRICE") {
                    item.price = parseFloat(field.ValueDetection?.Text?.replace(/[^0-9.]/g, '')) || 0;
                }
            }

            if (item.description || item.price) {
                data.items.push(item);
            }
        }
    }

    return data;
};

const handler = async (event) => {
    try {
        // Get the S3 bucket and key from the event
        const record = event.Records[0];
        const bucket = record.s3.bucket.name;
        const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));
        
        console.info("Processing receipt:", { bucket, key });

        // Get the image from S3
        const getObjectResponse = await s3Client.send(
            new GetObjectCommand({ Bucket: bucket, Key: key })
        );

        // Convert stream to buffer
        const imageBytes = await streamToBuffer(getObjectResponse.Body);

        // Call Textract
        const textractResponse = await textractClient.send(
            new AnalyzeExpenseCommand({
                Document: {
                    Bytes: imageBytes
                }
            })
        );

        // Process Textract response
        const processedData = processTextractResponse(textractResponse);

        // Generate a presigned URL for the receipt image
        const imageUrl = await getSignedUrl(
            s3Client,
            new GetObjectCommand({ Bucket: bucket, Key: key }),
            { expiresIn: 3600 * 24 * 7 } // URL valid for 7 days
        );

        // Create receipt record
        const timestamp = Date.now().toString();
        const receiptId = key.split('/').pop().split('.')[0];
        const receipt = {
            receiptId: { S: receiptId },
            userId: { S: "test-user" }, // Replace with actual user ID
            merchantName: { S: processedData.merchantName || "Unknown" },
            total: { N: processedData.total?.toString() || "0" },
            date: { S: processedData.date || new Date().toISOString() },
            category: { S: "Uncategorized" },
            imageUrl: { S: imageUrl },
            status: { S: "processed" },
            items: { S: JSON.stringify(processedData.items || []) },
            createdAt: { S: new Date().toISOString() },
            updatedAt: { S: new Date().toISOString() }
        };

        // Save to DynamoDB
        await dynamoClient.send(
            new PutItemCommand({
                TableName: "receipts",
                Item: receipt
            })
        );

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "Receipt processed successfully",
                receiptId,
                data: processedData
            })
        };
    } catch (error) {
        console.error("Error processing receipt:", error);
        throw error;
    }
};

module.exports = { handler };
