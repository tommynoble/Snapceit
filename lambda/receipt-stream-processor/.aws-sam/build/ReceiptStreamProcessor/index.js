const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, UpdateCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

// Categories with weighted keywords for better categorization
const CATEGORIES = {
    'Food & Dining': {
        strongKeywords: ['restaurant', 'cafe', 'diner', 'bistro', 'pizzeria', 'steakhouse', 'burrito'],
        mediumKeywords: ['food', 'meal', 'burger', 'pizza', 'sushi', 'kitchen'],
        weakKeywords: ['takeout', 'delivery', 'menu', 'plate', 'dish'],
        itemKeywords: ['burger', 'fries', 'salad', 'soup', 'drink', 'coffee', 'tea'],
        merchantTypes: ['restaurant', 'cafe', 'bar', 'food service']
    },
    'Transportation': {
        strongKeywords: ['uber', 'lyft', 'taxi', 'transport', 'transit'],
        mediumKeywords: ['gas', 'fuel', 'parking', 'station'],
        weakKeywords: ['ride', 'travel', 'car'],
        itemKeywords: ['gasoline', 'diesel', 'parking fee', 'fare'],
        merchantTypes: ['transportation', 'gas station', 'parking service']
    },
    'Office Supplies': {
        strongKeywords: ['staples', 'office depot', 'office max'],
        mediumKeywords: ['paper', 'printer', 'office', 'supplies'],
        weakKeywords: ['ink', 'toner', 'desk', 'chair'],
        itemKeywords: ['paper', 'pen', 'pencil', 'notebook', 'ink cartridge'],
        merchantTypes: ['office supply store', 'stationery store']
    },
    'Travel': {
        strongKeywords: ['hotel', 'airline', 'airbnb', 'booking.com'],
        mediumKeywords: ['flight', 'lodging', 'motel', 'resort'],
        weakKeywords: ['stay', 'accommodation', 'reservation'],
        itemKeywords: ['room charge', 'flight ticket', 'booking fee'],
        merchantTypes: ['hotel', 'airline', 'travel agency']
    },
    'Utilities': {
        strongKeywords: ['electric company', 'water service', 'gas company'],
        mediumKeywords: ['utility', 'power', 'energy', 'internet'],
        weakKeywords: ['bill', 'service', 'connection'],
        itemKeywords: ['electricity', 'water usage', 'gas service', 'internet'],
        merchantTypes: ['utility company', 'service provider']
    }
};

// Function to calculate confidence score for a category
function calculateConfidenceScore(merchantName, items = [], category) {
    const categoryData = CATEGORIES[category];
    merchantName = merchantName.toLowerCase();
    let score = 0;
    let matchedKeywords = [];

    console.log(`Checking category ${category} for merchant "${merchantName}"`, {
        items: items.map(item => item.name?.S || ''),
        categoryData
    });

    // Check merchant name against keywords with different weights
    categoryData.strongKeywords.forEach(keyword => {
        if (merchantName.includes(keyword.toLowerCase())) {
            score += 3;
            matchedKeywords.push({ keyword, weight: 'strong' });
            console.log(`Strong keyword match: ${keyword}`);
        }
    });

    categoryData.mediumKeywords.forEach(keyword => {
        if (merchantName.includes(keyword.toLowerCase())) {
            score += 2;
            matchedKeywords.push({ keyword, weight: 'medium' });
            console.log(`Medium keyword match: ${keyword}`);
        }
    });

    categoryData.weakKeywords.forEach(keyword => {
        if (merchantName.includes(keyword.toLowerCase())) {
            score += 1;
            matchedKeywords.push({ keyword, weight: 'weak' });
            console.log(`Weak keyword match: ${keyword}`);
        }
    });

    // Check items against item-specific keywords
    items.forEach(item => {
        const itemName = (item.name?.S || item.description?.S || '').toLowerCase();
        categoryData.itemKeywords.forEach(keyword => {
            if (itemName.includes(keyword.toLowerCase())) {
                score += 2;
                matchedKeywords.push({ keyword, type: 'item' });
                console.log(`Item keyword match: ${keyword} in ${itemName}`);
            }
        });
    });

    const result = {
        score,
        matchedKeywords,
        confidence: score >= 5 ? 'high' : score >= 3 ? 'medium' : 'low'
    };

    console.log(`Category ${category} final score:`, result);
    return result;
}

// Function to determine category with confidence
function determineCategory(merchantName, items = []) {
    let bestCategory = null;
    let highestScore = 0;
    let bestConfidence = null;
    let bestMatches = null;

    for (const [category, _] of Object.entries(CATEGORIES)) {
        const result = calculateConfidenceScore(merchantName, items, category);
        if (result.score > highestScore) {
            highestScore = result.score;
            bestCategory = category;
            bestConfidence = result.confidence;
            bestMatches = result.matchedKeywords;
        }
    }

    return {
        category: bestCategory || 'Uncategorized',
        confidence: bestConfidence || 'low',
        score: highestScore,
        matches: bestMatches || []
    };
}

// Function to identify if receipt is tax deductible
function isTaxDeductible(category, total) {
    const businessCategories = ['Office Supplies', 'Travel'];
    return businessCategories.includes(category);
}

// Function to determine the final category based on various inputs
function determineFinalCategory(suggestedCategory, suggestedConfidence, businessCategory, userCategory) {
    console.log('Determining final category:', {
        suggestedCategory,
        suggestedConfidence,
        businessCategory,
        userCategory
    });

    // If user has explicitly set a category, use that
    if (userCategory) {
        console.log('Using user-specified category:', userCategory);
        return userCategory;
    }
    
    // If our suggestion has high confidence, use that
    if (suggestedConfidence === 'high') {
        console.log('Using high-confidence suggested category:', suggestedCategory);
        return suggestedCategory;
    }
    
    // If we have a medium confidence and it's a known category, use it
    if (suggestedConfidence === 'medium' && CATEGORIES[suggestedCategory]) {
        console.log('Using medium-confidence suggested category:', suggestedCategory);
        return suggestedCategory;
    }
    
    // Otherwise, fall back to the business category from Textract
    console.log('Falling back to business category:', businessCategory || 'Uncategorized');
    return businessCategory || 'Uncategorized';
}

exports.handler = async (event) => {
    try {
        // Process each record in the stream
        for (const record of event.Records) {
            // Only process new receipts
            if (record.eventName !== 'INSERT') continue;
            
            const newReceipt = record.dynamodb.NewImage;
            
            // Skip if already processed
            if (newReceipt.status && newReceipt.status.S === 'processed') {
                continue;
            }
            
            const merchantName = newReceipt.merchant?.S || '';
            const items = newReceipt.items?.L || [];
            const businessCategory = newReceipt.businessCategory?.S;
            const userCategory = newReceipt.userCategory?.S;
            
            // Determine suggested category with confidence
            const categoryResult = determineCategory(merchantName, items);
            
            // Determine final category
            const finalCategory = determineFinalCategory(
                categoryResult.category,
                categoryResult.confidence,
                businessCategory,
                userCategory
            );
            
            // Check if tax deductible
            const taxDeductible = isTaxDeductible(finalCategory);
            
            console.log(`Processing receipt ${newReceipt.receiptId.S}:`, {
                merchant: merchantName,
                businessCategory,
                suggestedCategory: categoryResult.category,
                confidence: categoryResult.confidence,
                score: categoryResult.score,
                finalCategory,
                matchedKeywords: categoryResult.matches
            });
            
            // Update the receipt with processed information
            const updateParams = {
                TableName: 'receipts',
                Key: {
                    userId: newReceipt.userId.S,
                    receiptId: newReceipt.receiptId.S
                },
                UpdateExpression: 'SET category = :category, suggestedCategory = :suggested, categoryConfidence = :confidence, matchedKeywords = :matches, taxDeductible = :taxDeductible, #status = :status, updatedAt = :updatedAt',
                ExpressionAttributeValues: {
                    ':category': finalCategory,
                    ':suggested': categoryResult.category,
                    ':confidence': categoryResult.confidence,
                    ':matches': categoryResult.matches,
                    ':taxDeductible': taxDeductible,
                    ':status': 'processed',
                    ':updatedAt': new Date().toISOString()
                },
                ExpressionAttributeNames: {
                    '#status': 'status'
                }
            };
            
            await docClient.send(new UpdateCommand(updateParams));
        }
        
        return { statusCode: 200, body: 'Processing complete' };
    } catch (error) {
        console.error('Error processing stream:', error);
        throw error;
    }
};
