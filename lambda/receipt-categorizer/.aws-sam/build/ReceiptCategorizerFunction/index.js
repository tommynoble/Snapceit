"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const client_comprehend_1 = require("@aws-sdk/client-comprehend");
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const util_dynamodb_1 = require("@aws-sdk/util-dynamodb");
const comprehendClient = new client_comprehend_1.ComprehendClient({
    region: process.env.AWS_REGION || 'us-east-1'
});
const ddbClient = new client_dynamodb_1.DynamoDBClient({
    region: process.env.AWS_REGION || 'us-east-1'
});
const dynamodb = lib_dynamodb_1.DynamoDBDocumentClient.from(ddbClient);
const BUSINESS_CATEGORIES = {
    office_supplies: {
        terms: ['office', 'supplies', 'paper', 'printer', 'ink', 'staples', 'folders'],
        merchants: ['office depot', 'staples', 'officemax'],
        weight: 1.2
    },
    food_and_dining: {
        terms: ['restaurant', 'food', 'meal', 'lunch', 'dinner', 'breakfast', 'cafe', 'coffee'],
        merchants: ['mcdonalds', 'starbucks', 'subway', 'chipotle'],
        weight: 1.0
    },
    travel: {
        terms: ['hotel', 'flight', 'airline', 'car rental', 'taxi', 'uber', 'lyft'],
        merchants: ['marriott', 'hilton', 'delta', 'united', 'american airlines', 'hertz', 'enterprise'],
        weight: 1.1
    },
    utilities: {
        terms: ['electric', 'water', 'gas', 'internet', 'phone', 'utility'],
        merchants: ['at&t', 'verizon', 'comcast', 'pg&e'],
        weight: 0.9
    },
    entertainment: {
        terms: ['movie', 'theatre', 'concert', 'show', 'game', 'ticket'],
        merchants: ['netflix', 'hulu', 'spotify', 'amc', 'ticketmaster'],
        weight: 0.8
    }
};
// Validate BUSINESS_CATEGORIES at startup
for (const [category, data] of Object.entries(BUSINESS_CATEGORIES)) {
    if (!Array.isArray(data.terms)) {
        throw new Error(`Invalid BUSINESS_CATEGORIES: ${category} is missing terms array`);
    }
}
async function detectEntities(text) {
    try {
        console.log('Calling Comprehend DetectEntities with text:', text.substring(0, 100) + '...');
        const command = new client_comprehend_1.DetectEntitiesCommand({
            Text: text,
            LanguageCode: 'en'
        });
        const response = await comprehendClient.send(command);
        console.log('Comprehend DetectEntities response:', JSON.stringify(response, null, 2));
        return response.Entities || [];
    }
    catch (error) {
        console.error('Error in detectEntities:', error);
        if (error instanceof Error) {
            console.error('Error name:', error.name);
            console.error('Error message:', error.message);
        }
        throw error;
    }
}
async function detectKeyPhrases(text) {
    try {
        console.log('Calling Comprehend DetectKeyPhrases with text:', text.substring(0, 100) + '...');
        const command = new client_comprehend_1.DetectKeyPhrasesCommand({
            Text: text,
            LanguageCode: 'en'
        });
        const response = await comprehendClient.send(command);
        console.log('Comprehend DetectKeyPhrases response:', JSON.stringify(response, null, 2));
        return response.KeyPhrases || [];
    }
    catch (error) {
        console.error('Error in detectKeyPhrases:', error);
        if (error instanceof Error) {
            console.error('Error name:', error.name);
            console.error('Error message:', error.message);
        }
        throw error;
    }
}
async function updateReceiptCategory(receipt, categoryResult) {
    const dynamoClient = new client_dynamodb_1.DynamoDBClient({ region: process.env.AWS_REGION });
    const docClient = lib_dynamodb_1.DynamoDBDocumentClient.from(dynamoClient);
    const now = new Date().toISOString();
    try {
        console.log('Updating receipt category with params:', {
            tableName: process.env.RECEIPTS_TABLE,
            receiptId: receipt.receiptId,
            userId: receipt.userId,
            category: categoryResult.category,
            confidence: categoryResult.confidence
        });
        const updateCommand = new lib_dynamodb_1.UpdateCommand({
            TableName: process.env.RECEIPTS_TABLE,
            Key: {
                receiptId: receipt.receiptId,
                userId: receipt.userId
            },
            UpdateExpression: 'SET #category = :category, #confidence = :confidence, #source = :source, #status = :status, #updatedAt = :updatedAt',
            ExpressionAttributeNames: {
                '#category': 'category',
                '#confidence': 'confidence',
                '#source': 'source',
                '#status': 'status',
                '#updatedAt': 'updatedAt'
            },
            ExpressionAttributeValues: {
                ':category': categoryResult.category,
                ':confidence': categoryResult.confidence,
                ':source': categoryResult.source,
                ':status': 'processed',
                ':updatedAt': now
            }
        });
        console.log('UpdateCommand:', JSON.stringify(updateCommand));
        const result = await docClient.send(updateCommand);
        console.log('Update result:', JSON.stringify(result));
        console.log('Successfully updated receipt category:', receipt.receiptId);
    }
    catch (error) {
        console.error('Error updating receipt category:', {
            error,
            tableName: process.env.RECEIPTS_TABLE,
            receiptId: receipt.receiptId,
            category: categoryResult.category
        });
        throw error;
    }
}
async function determineCategory(entities, keyPhrases) {
    console.log('Determining category with:', {
        entities: JSON.stringify(entities),
        keyPhrases: JSON.stringify(keyPhrases)
    });
    // Extract text from entities and key phrases, ensuring they exist
    const entityTexts = entities
        .filter(entity => entity && entity.Text)
        .map(entity => entity.Text);
    const keyPhraseTexts = keyPhrases
        .filter(phrase => phrase && phrase.Text)
        .map(phrase => phrase.Text);
    console.log('Processed texts:', {
        entityTexts,
        keyPhraseTexts
    });
    // Define category keywords
    const categoryKeywords = {
        'Groceries': ['grocery', 'food', 'supermarket', 'produce', 'meat', 'dairy', 'bakery'],
        'Restaurant': ['restaurant', 'cafe', 'dining', 'food', 'meal', 'menu', 'waiter', 'chef'],
        'Shopping': ['retail', 'store', 'mall', 'clothing', 'fashion', 'shop', 'purchase'],
        'Transportation': ['gas', 'fuel', 'uber', 'lyft', 'taxi', 'train', 'bus', 'metro', 'transport'],
        'Entertainment': ['movie', 'theatre', 'concert', 'show', 'ticket', 'event', 'game'],
        'Healthcare': ['pharmacy', 'doctor', 'medical', 'health', 'clinic', 'hospital', 'medicine'],
        'Utilities': ['electric', 'water', 'gas', 'internet', 'phone', 'utility', 'bill'],
        'Travel': ['hotel', 'flight', 'airline', 'travel', 'booking', 'vacation', 'trip']
    };
    // Initialize category scores
    const categoryScores = {};
    // Function to check if a text contains any keywords (case insensitive)
    const containsKeyword = (text, keywords) => {
        if (!text)
            return false;
        return keywords.some(keyword => {
            const pattern = new RegExp(keyword, 'i');
            return pattern.test(text);
        });
    };
    // Score categories based on entities and key phrases
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
        let score = 0;
        // Check entities
        entityTexts.forEach(text => {
            if (containsKeyword(text, keywords)) {
                score += 2; // Entities are weighted more
            }
        });
        // Check key phrases
        keyPhraseTexts.forEach(text => {
            if (containsKeyword(text, keywords)) {
                score += 1;
            }
        });
        if (score > 0) {
            categoryScores[category] = score;
        }
    }
    console.log('Category scores:', categoryScores);
    // Find category with highest score
    let maxScore = 0;
    let bestCategory = 'Other';
    for (const [category, score] of Object.entries(categoryScores)) {
        if (score > maxScore) {
            maxScore = score;
            bestCategory = category;
        }
    }
    const confidence = maxScore > 0 ? Math.min(maxScore / 5, 1) : 0.1;
    return {
        category: bestCategory,
        confidence,
        source: 'auto_detected'
    };
}
const handler = async (event) => {
    try {
        console.log('Environment variables:', {
            RECEIPTS_TABLE: process.env.RECEIPTS_TABLE,
            AWS_REGION: process.env.AWS_REGION
        });
        console.log('Processing DynamoDB Stream event:', JSON.stringify(event));
        if (!Array.isArray(event.Records)) {
            console.error('Invalid event structure - no Records array');
            return;
        }
        for (const record of event.Records) {
            // Log raw record
            console.log('Raw record:', JSON.stringify(record));
            // Validate record structure
            if (!record.dynamodb?.NewImage) {
                console.log('Skipping invalid record - missing NewImage');
                continue;
            }
            try {
                // Parse the receipt data
                console.log('Raw NewImage:', JSON.stringify(record.dynamodb.NewImage));
                const receipt = (0, util_dynamodb_1.unmarshall)(record.dynamodb.NewImage);
                console.log('Unmarshalled receipt:', JSON.stringify(receipt));
                // Validate required fields
                if (!receipt.receiptId || !receipt.userId) {
                    console.error('Invalid receipt - missing receiptId or userId:', receipt);
                    continue;
                }
                // Skip receipts without Textract data
                if (!receipt.items || !receipt.merchantName) {
                    console.log('Skipping receipt - no Textract data available:', receipt.receiptId);
                    return;
                }
                // Combine merchant name and item descriptions for analysis
                const textToAnalyze = [
                    receipt.merchantName,
                    ...receipt.items.map(item => item.description)
                ].join('\n');
                console.log('Processing receipt text:', textToAnalyze);
                // Skip if already processed
                if (receipt.status === 'processed' && receipt.category) {
                    console.log('Skipping already processed receipt:', receipt.receiptId);
                    continue;
                }
                console.log('Analyzing receipt text:', {
                    receiptId: receipt.receiptId,
                    text: textToAnalyze
                });
                // Run Comprehend analysis in parallel
                const [entityResponse, keyPhrasesResponse] = await Promise.all([
                    detectEntities(textToAnalyze),
                    detectKeyPhrases(textToAnalyze)
                ]);
                console.log('Comprehend analysis complete:', {
                    receiptId: receipt.receiptId,
                    entityCount: entityResponse.length,
                    keyPhraseCount: keyPhrasesResponse.length,
                    entities: entityResponse,
                    keyPhrases: keyPhrasesResponse
                });
                const categoryResult = await determineCategory(entityResponse, keyPhrasesResponse);
                console.log('Category result:', categoryResult);
                await updateReceiptCategory(receipt, categoryResult);
            }
            catch (error) {
                console.error('Error processing record:', {
                    error,
                    recordId: record.eventID,
                    receiptId: record.dynamodb?.NewImage?.receiptId
                });
                throw error;
            }
        }
    }
    catch (error) {
        console.error('Error in Lambda handler:', error);
        throw error;
    }
};
exports.handler = handler;
//# sourceMappingURL=index.js.map