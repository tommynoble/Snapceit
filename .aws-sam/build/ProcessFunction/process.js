const { TextractClient, AnalyzeDocumentCommand } = require('@aws-sdk/client-textract');
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');

const textract = new TextractClient({});
const s3 = new S3Client({});

const BUCKET_NAME = process.env.BUCKET_NAME;
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || 'http://localhost:5184';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
  'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
  'Access-Control-Allow-Methods': 'POST,OPTIONS',
  'Access-Control-Allow-Credentials': 'true'
};

exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    };
  }

  try {
    const { imageKey } = JSON.parse(event.body);

    if (!imageKey) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ message: 'Image key is required' })
      };
    }

    // Get the image from S3
    const getObjectResponse = await s3.send(new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: imageKey
    }));

    // Analyze the document with Textract
    const textractResponse = await textract.send(new AnalyzeDocumentCommand({
      Document: {
        Bytes: await streamToBuffer(getObjectResponse.Body)
      },
      FeatureTypes: ['FORMS', 'TABLES']
    }));

    // Extract receipt information
    const receiptData = extractReceiptData(textractResponse);

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify(receiptData)
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ 
        message: 'Failed to process receipt',
        error: error.message 
      })
    };
  }
};

// Helper function to convert stream to buffer
async function streamToBuffer(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

// Helper function to extract receipt data from Textract response
function extractReceiptData(textractResponse) {
  const blocks = textractResponse.Blocks;
  const keyMap = {};
  const valueMap = {};
  const blockMap = {};

  // First pass: create maps of key-value relationships and blocks
  blocks.forEach(block => {
    blockMap[block.Id] = block;
    if (block.BlockType === 'KEY_VALUE_SET') {
      if (block.EntityTypes?.includes('KEY')) {
        const key = getTextFromBlock(block, blocks);
        keyMap[block.Id] = key.toLowerCase();
      } else if (block.EntityTypes?.includes('VALUE')) {
        const value = getTextFromBlock(block, blocks);
        valueMap[block.Id] = value;
      }
    }
  });

  // Extract values
  const receipt = {
    merchant: '',
    total: 0,
    date: '',
    items: [],
    tax: {
      total: 0,
      type: 'sales'
    },
    subtotal: 0
  };

  // Second pass: extract key-value relationships
  blocks.forEach(block => {
    if (block.BlockType === 'KEY_VALUE_SET' && block.EntityTypes?.includes('KEY')) {
      const key = keyMap[block.Id];
      const valueBlock = block.Relationships?.find(r => r.Type === 'VALUE');
      if (valueBlock) {
        const value = valueMap[valueBlock.Ids[0]];
        
        switch (key) {
          case 'total':
          case 'amount':
          case 'grand total':
            receipt.total = parseFloat(value.replace(/[^0-9.]/g, '')) || 0;
            break;
          case 'subtotal':
            receipt.subtotal = parseFloat(value.replace(/[^0-9.]/g, '')) || 0;
            break;
          case 'tax':
          case 'sales tax':
            receipt.tax.total = parseFloat(value.replace(/[^0-9.]/g, '')) || 0;
            break;
          case 'date':
            receipt.date = value;
            break;
          case 'merchant':
          case 'business':
          case 'store':
            receipt.merchant = value;
            break;
        }
      }
    }
  });

  // Extract items from tables
  blocks.forEach(block => {
    if (block.BlockType === 'TABLE') {
      const tableItems = extractTableItems(block, blocks);
      receipt.items.push(...tableItems);
    }
  });

  return receipt;
}

// Helper function to get text from a block
function getTextFromBlock(block, blocks) {
  if (block.Text) {
    return block.Text;
  }

  let text = '';
  if (block.Relationships) {
    block.Relationships.forEach(relationship => {
      if (relationship.Type === 'CHILD') {
        relationship.Ids.forEach(childId => {
          const child = blocks.find(b => b.Id === childId);
          if (child?.Text) {
            text += child.Text + ' ';
          }
        });
      }
    });
  }
  return text.trim();
}

// Helper function to extract items from a table
function extractTableItems(tableBlock, blocks) {
  const items = [];
  const cells = {};
  const headerRow = [];

  // First pass: map cells
  blocks.forEach(block => {
    if (block.BlockType === 'CELL' && block.RowIndex === 1) {
      headerRow[block.ColumnIndex - 1] = getTextFromBlock(block, blocks).toLowerCase();
    } else if (block.BlockType === 'CELL' && block.RowIndex > 1) {
      if (!cells[block.RowIndex]) {
        cells[block.RowIndex] = {};
      }
      cells[block.RowIndex][block.ColumnIndex] = getTextFromBlock(block, blocks);
    }
  });

  // Second pass: create items
  Object.keys(cells).forEach(rowIndex => {
    const row = cells[rowIndex];
    const item = {
      name: '',
      price: 0,
      quantity: 1
    };

    Object.keys(row).forEach(colIndex => {
      const header = headerRow[parseInt(colIndex) - 1];
      const value = row[colIndex];

      switch (header) {
        case 'item':
        case 'description':
        case 'product':
          item.name = value;
          break;
        case 'price':
        case 'amount':
          item.price = parseFloat(value.replace(/[^0-9.]/g, '')) || 0;
          break;
        case 'qty':
        case 'quantity':
          item.quantity = parseInt(value) || 1;
          break;
      }
    });

    if (item.name && item.price > 0) {
      items.push(item);
    }
  });

  return items;
}
