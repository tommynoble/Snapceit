const { DynamoDBClient, QueryCommand, UpdateItemCommand } = require("@aws-sdk/client-dynamodb");

const dynamoClient = new DynamoDBClient({ region: "us-east-1" });

// Get receipts by category
const getReceiptsByCategory = async (userId, category) => {
    const params = {
        TableName: process.env.RECEIPTS_TABLE,
        IndexName: "userCategory",
        KeyConditionExpression: "userId = :userId AND category = :category",
        ExpressionAttributeValues: {
            ":userId": { S: userId },
            ":category": { S: category }
        }
    };

    const command = new QueryCommand(params);
    const response = await dynamoClient.send(command);
    return response.Items;
};

// Get all categories for a user
const getUserCategories = async (userId) => {
    const params = {
        TableName: process.env.RECEIPTS_TABLE,
        IndexName: "userCategory",
        KeyConditionExpression: "userId = :userId",
        ProjectionExpression: "category",
        ExpressionAttributeValues: {
            ":userId": { S: userId }
        }
    };

    const command = new QueryCommand(params);
    const response = await dynamoClient.send(command);
    
    // Extract unique categories
    const categories = new Set(response.Items.map(item => item.category.S));
    return Array.from(categories);
};

// Update receipt category
const updateReceiptCategory = async (userId, receiptId, newCategory) => {
    const params = {
        TableName: process.env.RECEIPTS_TABLE,
        Key: {
            userId: { S: userId },
            receiptId: { S: receiptId }
        },
        UpdateExpression: "SET category = :category, updatedAt = :updatedAt",
        ExpressionAttributeValues: {
            ":category": { S: newCategory },
            ":updatedAt": { S: new Date().toISOString() }
        },
        ReturnValues: "ALL_NEW"
    };

    const command = new UpdateItemCommand(params);
    const response = await dynamoClient.send(command);
    return response.Attributes;
};

// Main handler for API Gateway events
exports.handler = async (event) => {
    try {
        console.log('Full Event:', JSON.stringify(event, null, 2));
        console.log('RequestContext:', JSON.stringify(event.requestContext, null, 2));
        
        // Check different possible locations for the user ID
        const userId = event.requestContext?.authorizer?.claims?.sub || 
                      event.requestContext?.authorizer?.jwt?.claims?.sub ||
                      event.requestContext?.authorizer?.sub;
                      
        console.log('Found userId:', userId);
        
        if (!userId) {
            console.log('No userId found in any location');
            console.log('Authorizer:', JSON.stringify(event.requestContext?.authorizer, null, 2));
            return {
                statusCode: 401,
                body: JSON.stringify({ message: "Unauthorized" })
            };
        }

        const method = event.httpMethod;
        const path = event.path;

        // GET /categories - Get all categories for user
        if (method === "GET" && path === "/categories") {
            const categories = await getUserCategories(userId);
            return {
                statusCode: 200,
                body: JSON.stringify({ categories })
            };
        }

        // GET /categories/{category}/receipts - Get receipts by category
        if (method === "GET" && path.match(/^\/categories\/.*\/receipts$/)) {
            const category = decodeURIComponent(path.split('/')[2]);
            const receipts = await getReceiptsByCategory(userId, category);
            return {
                statusCode: 200,
                body: JSON.stringify({ receipts })
            };
        }

        // PUT /receipts/{receiptId}/category - Update receipt category
        if (method === "PUT" && path.match(/^\/receipts\/.*\/category$/)) {
            const receiptId = path.split('/')[2];
            const { category } = JSON.parse(event.body);
            
            if (!category) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({ message: "Category is required" })
                };
            }

            const updatedReceipt = await updateReceiptCategory(userId, receiptId, category);
            return {
                statusCode: 200,
                body: JSON.stringify({ receipt: updatedReceipt })
            };
        }

        return {
            statusCode: 404,
            body: JSON.stringify({ message: "Not Found" })
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Internal Server Error" })
        };
    }
};
