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

// Define category rules
const categoryRules = {
    groceries: {
        keywords: [
            'grocery', 'supermarket', 'food', 'produce', 'meat', 'dairy',
            'fruit', 'vegetable', 'bread', 'cereal', 'snack', 'beverage',
            'sugar', 'oil', 'flour', 'rice', 'pasta', 'milk', 'egg'
        ],
        stores: ['walmart', 'kroger', 'safeway', 'costco', 'aldi', 'trader', 'whole foods']
    },
    restaurant: {
        keywords: [
            'restaurant', 'cafe', 'diner', 'bistro', 'grill', 'burger',
            'pizza', 'sushi', 'sandwich', 'meal', 'drink', 'appetizer'
        ]
    },
    pharmacy: {
        keywords: [
            'pharmacy', 'drug', 'prescription', 'medicine', 'health',
            'vitamin', 'supplement', 'medical', 'healthcare'
        ],
        stores: ['cvs', 'walgreens', 'rite aid']
    },
    electronics: {
        keywords: [
            'electronics', 'computer', 'phone', 'tablet', 'laptop',
            'charger', 'cable', 'battery', 'device', 'gadget'
        ],
        stores: ['best buy', 'apple', 'microsoft']
    },
    clothing: {
        keywords: [
            'clothing', 'apparel', 'shirt', 'pants', 'dress', 'shoes',
            'jacket', 'accessories', 'fashion'
        ],
        stores: ['macys', 'nordstrom', 'target', 'tjmaxx', 'marshalls']
    },
    office: {
        keywords: [
            'office', 'supplies', 'paper', 'pen', 'pencil', 'ink',
            'printer', 'staples', 'folder', 'notebook'
        ],
        stores: ['office depot', 'staples']
    }
};

const categorizeReceipt = (merchantName, items) => {
    const scores = {};
    const merchantLower = merchantName.toLowerCase();
    const itemDescriptions = items.map(item => item.description.toLowerCase());

    // Initialize scores for each category
    Object.keys(categoryRules).forEach(category => {
        scores[category] = 0;
    });

    // Score based on merchant name
    Object.entries(categoryRules).forEach(([category, rules]) => {
        if (rules.stores?.some(store => merchantLower.includes(store))) {
            scores[category] += 3; // Higher weight for store match
        }
    });

    // Score based on items
    itemDescriptions.forEach(itemDesc => {
        Object.entries(categoryRules).forEach(([category, rules]) => {
            if (rules.keywords.some(keyword => itemDesc.includes(keyword))) {
                scores[category] += 1;
            }
        });
    });

    // Get category with highest score
    const topCategory = Object.entries(scores)
        .sort(([,a], [,b]) => b - a)
        .filter(([,score]) => score > 0)[0];

    return topCategory ? topCategory[0].charAt(0).toUpperCase() + topCategory[0].slice(1) : 'Uncategorized';
};

const processTextractResponse = (response) => {
    const data = {
        merchantName: "Unknown",
        total: 0,
        date: "",
        items: [],
        category: "Uncategorized",
        subtotal: 0,
        taxAmount: 0,
        discounts: [],
        paymentMethod: "",
        storeLocation: ""
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

        // Get tax amount
        const taxField = document.SummaryFields?.find(
            field => field.Type?.Text === "TAX"
        );
        if (taxField?.ValueDetection?.Text) {
            data.taxAmount = parseFloat(taxField.ValueDetection.Text.replace(/[^0-9.]/g, '')) || 0;
        }

        // Get subtotal
        const subtotalField = document.SummaryFields?.find(
            field => field.Type?.Text === "SUBTOTAL"
        );
        if (subtotalField?.ValueDetection?.Text) {
            data.subtotal = parseFloat(subtotalField.ValueDetection.Text.replace(/[^0-9.]/g, '')) || 0;
        }

        // Get line items
        for (const lineItem of document.LineItemGroups?.[0]?.LineItems || []) {
            const item = {
                description: "",
                price: 0,
                quantity: 1,
                unitPrice: 0
            };

            for (const field of lineItem.LineItemExpenseFields || []) {
                if (field.Type?.Text === "ITEM") {
                    item.description = field.ValueDetection?.Text || "";
                } else if (field.Type?.Text === "PRICE") {
                    item.price = parseFloat(field.ValueDetection?.Text?.replace(/[^0-9.]/g, '')) || 0;
                } else if (field.Type?.Text === "QUANTITY") {
                    item.quantity = parseFloat(field.ValueDetection?.Text?.replace(/[^0-9.]/g, '')) || 1;
                } else if (field.Type?.Text === "UNIT_PRICE") {
                    item.unitPrice = parseFloat(field.ValueDetection?.Text?.replace(/[^0-9.]/g, '')) || 0;
                }
            }

            if (item.description || item.price) {
                data.items.push(item);
            }
        }
    }

    // Categorize the receipt based on merchant and items
    data.category = categorizeReceipt(data.merchantName, data.items);

    return data;
};

const handler = async (event) => {
    try {
        const records = event.Records;
        const results = [];

        for (const record of records) {
            console.log('Processing receipt:', record.s3);

            // Get the receipt image from S3
            const s3Object = await s3Client.send(
                new GetObjectCommand({
                    Bucket: record.s3.bucket.name,
                    Key: record.s3.object.key,
                })
            );

            // Convert stream to buffer
            const imageBytes = await streamToBuffer(s3Object.Body);

            // Process with Textract
            const textractResponse = await textractClient.send(
                new AnalyzeExpenseCommand({
                    Document: {
                        Bytes: imageBytes,
                    },
                })
            );

            // Process Textract response
            const receiptData = processTextractResponse(textractResponse);

            // Generate a presigned URL for the receipt image
            const imageUrl = await getSignedUrl(
                s3Client,
                new GetObjectCommand({
                    Bucket: record.s3.bucket.name,
                    Key: record.s3.object.key,
                }),
                { expiresIn: 604800 } // URL expires in 7 days
            );

            // Prepare DynamoDB item
            const receiptId = record.s3.object.key.split('.')[0];
            const timestamp = new Date().toISOString();
            
            const item = {
                userId: { S: 'test-user' }, // Replace with actual user ID
                receiptId: { S: receiptId },
                merchantName: { S: receiptData.merchantName },
                total: { N: receiptData.total.toString() },
                date: { S: receiptData.date || timestamp },
                items: { S: JSON.stringify(receiptData.items) },
                category: { S: receiptData.category },
                subtotal: { N: (receiptData.subtotal || receiptData.total).toString() },
                taxAmount: { N: (receiptData.taxAmount || 0).toString() },
                discounts: { S: JSON.stringify(receiptData.discounts || []) },
                paymentMethod: { S: receiptData.paymentMethod || 'Unknown' },
                storeLocation: { S: receiptData.storeLocation || 'Unknown' },
                status: { S: 'processed' },
                imageUrl: { S: imageUrl },
                createdAt: { S: timestamp },
                updatedAt: { S: timestamp }
            };

            // Save to DynamoDB
            await dynamoClient.send(
                new PutItemCommand({
                    TableName: process.env.TABLE_NAME,
                    Item: item
                })
            );

            results.push({
                receiptId,
                status: 'success'
            });
        }

        return {
            statusCode: 200,
            body: JSON.stringify(results)
        };
    } catch (error) {
        console.error('Error processing receipt:', error);
        throw error;
    }
};

module.exports = { handler };
