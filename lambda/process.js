const middy = require('@middy/core');
const cors = require('@middy/http-cors');
const httpJsonBodyParser = require('@middy/http-json-body-parser');
const httpErrorHandler = require('@middy/http-error-handler');
const { Textract } = require('aws-sdk');

const textract = new Textract();
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || 'http://localhost:5184';

// Base handler
const baseHandler = async (event) => {
  const { imageKey } = event.body;

  if (!imageKey) {
    throw new Error('Image key is required');
  }

  try {
    // Call Textract to analyze the receipt
    const params = {
      Document: {
        S3Object: {
          Bucket: process.env.BUCKET_NAME,
          Name: imageKey
        }
      },
      FeatureTypes: ['FORMS', 'TABLES']
    };

    const result = await textract.analyzeDocument(params).promise();

    // Process Textract response
    const processedData = {
      merchant: '',
      total: 0,
      date: '',
      items: [],
      raw: result
    };

    // Extract key fields from blocks
    result.Blocks.forEach(block => {
      if (block.BlockType === 'LINE') {
        const text = block.Text.toLowerCase();
        
        // Try to find merchant name (usually at the top)
        if (!processedData.merchant && block.Page === 1) {
          processedData.merchant = block.Text;
        }

        // Look for total amount
        if (text.includes('total')) {
          const totalMatch = block.Text.match(/\$?\d+\.\d{2}/);
          if (totalMatch) {
            processedData.total = parseFloat(totalMatch[0].replace('$', ''));
          }
        }

        // Look for date
        const dateMatch = block.Text.match(/\d{1,2}[-/]\d{1,2}[-/]\d{2,4}/);
        if (dateMatch) {
          processedData.date = dateMatch[0];
        }
      }

      // Extract items from tables
      if (block.BlockType === 'TABLE') {
        const tableItems = [];
        let currentItem = {};

        block.Relationships?.forEach(relationship => {
          if (relationship.Type === 'CHILD') {
            relationship.Ids.forEach(cellId => {
              const cell = result.Blocks.find(b => b.Id === cellId);
              if (cell?.Text) {
                // Try to identify if this is an item description or price
                const priceMatch = cell.Text.match(/\$?\d+\.\d{2}/);
                if (priceMatch) {
                  currentItem.price = parseFloat(priceMatch[0].replace('$', ''));
                  tableItems.push(currentItem);
                  currentItem = {};
                } else {
                  currentItem.name = cell.Text;
                }
              }
            });
          }
        });

        if (tableItems.length > 0) {
          processedData.items = tableItems;
        }
      }
    });

    return {
      statusCode: 200,
      body: JSON.stringify(processedData)
    };
  } catch (error) {
    console.error('Error processing receipt:', error);
    throw new Error('Failed to process receipt: ' + error.message);
  }
};

// Middy handler with middleware
const handler = middy(baseHandler)
  .use(httpJsonBodyParser())
  .use(httpErrorHandler())
  .use(cors({
    origin: ALLOWED_ORIGIN,
    credentials: true,
    headers: 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
    methods: 'POST,OPTIONS'
  }));

module.exports = { handler };
