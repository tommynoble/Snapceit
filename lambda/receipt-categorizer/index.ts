import { 
  ComprehendClient, 
  DetectEntitiesCommand,
  DetectKeyPhrasesCommand,
  Entity,
  KeyPhrase
} from "@aws-sdk/client-comprehend";
import { 
  DynamoDBStreamEvent, 
  DynamoDBRecord,
  Context 
} from 'aws-lambda';
import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';

const comprehend = new ComprehendClient({
  region: process.env.AWS_REGION
});
const dynamodb = new DynamoDB({
  region: process.env.AWS_REGION
});

interface Receipt {
  id: string;
  userId: string;
  merchantName: string;
  total: number;
  items?: Array<{
    description: string;
    price: number;
  }>;
  extractedText?: string;
  category?: {
    id: string;
    confidence: number;
    source: 'auto_detected' | 'user_defined';
  };
}

async function detectEntities(text: string) {
  const command = new DetectEntitiesCommand({
    Text: text,
    LanguageCode: 'en'
  });
  
  try {
    const response = await comprehend.send(command);
    return response.Entities || [];
  } catch (error) {
    console.error('Error detecting entities:', error);
    return [];
  }
}

async function detectKeyPhrases(text: string) {
  const command = new DetectKeyPhrasesCommand({
    Text: text,
    LanguageCode: 'en'
  });
  
  try {
    const response = await comprehend.send(command);
    return response.KeyPhrases || [];
  } catch (error) {
    console.error('Error detecting key phrases:', error);
    return [];
  }
}

function determineCategory(
  entities: Entity[],
  keyPhrases: KeyPhrase[],
  merchantName: string
): { category: string; confidence: number } {
  // Define category patterns
  const categoryPatterns = {
    food_dining: {
      entities: ['ORGANIZATION', 'COMMERCIAL_ITEM'],
      terms: ['restaurant', 'cafe', 'coffee', 'food', 'dining', 'meal']
    },
    office_expenses: {
      entities: ['COMMERCIAL_ITEM', 'ORGANIZATION'],
      terms: ['office', 'supplies', 'paper', 'printer', 'desk']
    },
    travel: {
      entities: ['LOCATION', 'ORGANIZATION'],
      terms: ['hotel', 'flight', 'taxi', 'uber', 'train']
    }
  };

  // Score each category
  const scores = new Map<string, number>();

  // Check entities
  entities.forEach(entity => {
    if (entity.Score && entity.Score > 0.7) {
      Object.entries(categoryPatterns).forEach(([category, pattern]) => {
        if (pattern.entities.includes(entity.Type)) {
          scores.set(
            category,
            (scores.get(category) || 0) + entity.Score
          );
        }
      });
    }
  });

  // Check key phrases
  keyPhrases.forEach(phrase => {
    if (phrase.Score && phrase.Score > 0.7) {
      Object.entries(categoryPatterns).forEach(([category, pattern]) => {
        if (pattern.terms.some(term => 
          phrase.Text.toLowerCase().includes(term)
        )) {
          scores.set(
            category,
            (scores.get(category) || 0) + phrase.Score
          );
        }
      });
    }
  });

  // Get highest scoring category
  let bestCategory = 'other_expenses';
  let highestScore = 0;

  scores.forEach((score, category) => {
    if (score > highestScore) {
      highestScore = score;
      bestCategory = category;
    }
  });

  return {
    category: bestCategory,
    confidence: highestScore / (entities.length + keyPhrases.length)
  };
}

async function updateReceiptCategory(
  receiptId: string,
  userId: string,
  category: string,
  confidence: number
) {
  const params = {
    TableName: process.env.RECEIPTS_TABLE,
    Key: {
      id: { S: receiptId },
      userId: { S: userId }
    },
    UpdateExpression: 'SET category = :category',
    ExpressionAttributeValues: {
      ':category': {
        M: {
          id: { S: category },
          confidence: { N: confidence.toString() },
          source: { S: 'auto_detected' }
        }
      }
    }
  };

  try {
    await dynamodb.updateItem(params);
    console.log(`Updated receipt ${receiptId} with category ${category}`);
  } catch (error) {
    console.error('Error updating receipt:', error);
    throw error;
  }
}

export async function handler(event: DynamoDBStreamEvent, context: Context) {
  try {
    for (const record of event.Records) {
      if (record.eventName === 'INSERT') {
        const receipt = unmarshall(record.dynamodb.NewImage) as Receipt;
        
        // Combine all text for analysis
        const textToAnalyze = [
          receipt.merchantName,
          receipt.extractedText,
          ...(receipt.items?.map(item => item.description) || [])
        ].join(' ');

        // Run entity and key phrase detection in parallel
        const [entities, keyPhrases] = await Promise.all([
          detectEntities(textToAnalyze),
          detectKeyPhrases(textToAnalyze)
        ]);

        // Determine category
        const { category, confidence } = determineCategory(
          entities,
          keyPhrases,
          receipt.merchantName
        );

        // Update receipt with category
        await updateReceiptCategory(
          receipt.id,
          receipt.userId,
          category,
          confidence
        );
      }
    }
  } catch (error) {
    console.error('Error processing receipt:', error);
    throw error;
  }
}
