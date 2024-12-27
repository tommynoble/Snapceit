import { DynamoDBClient, CreateTableCommand } from "@aws-sdk/client-dynamodb";
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const client = new DynamoDBClient({
  region: process.env.VITE_AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.VITE_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.VITE_AWS_SECRET_ACCESS_KEY!,
  },
});

async function createUsersTable() {
  const command = new CreateTableCommand({
    TableName: 'users',
    AttributeDefinitions: [
      {
        AttributeName: 'userId',
        AttributeType: 'S',
      },
      {
        AttributeName: 'email',
        AttributeType: 'S',
      }
    ],
    KeySchema: [
      {
        AttributeName: 'userId',
        KeyType: 'HASH',
      }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'EmailIndex',
        KeySchema: [
          {
            AttributeName: 'email',
            KeyType: 'HASH',
          }
        ],
        Projection: {
          ProjectionType: 'ALL'
        },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5
        }
      }
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5
    }
  });

  try {
    const response = await client.send(command);
    console.log("Users table created successfully:", response);
  } catch (error) {
    if ((error as any).name === 'ResourceInUseException') {
      console.log("Users table already exists");
    } else {
      throw error;
    }
  }
}

async function createUserSettingsTable() {
  const command = new CreateTableCommand({
    TableName: 'user_settings',
    AttributeDefinitions: [
      {
        AttributeName: 'userId',
        AttributeType: 'S',
      }
    ],
    KeySchema: [
      {
        AttributeName: 'userId',
        KeyType: 'HASH',
      }
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5
    }
  });

  try {
    const response = await client.send(command);
    console.log("User Settings table created successfully:", response);
  } catch (error) {
    if ((error as any).name === 'ResourceInUseException') {
      console.log("User Settings table already exists");
    } else {
      throw error;
    }
  }
}

async function createReceiptsTable() {
  const command = new CreateTableCommand({
    TableName: 'receipts',
    AttributeDefinitions: [
      {
        AttributeName: 'userId',
        AttributeType: 'S',
      },
      {
        AttributeName: 'receiptId',
        AttributeType: 'S',
      },
      {
        AttributeName: 'date',
        AttributeType: 'S',
      }
    ],
    KeySchema: [
      {
        AttributeName: 'userId',
        KeyType: 'HASH',
      },
      {
        AttributeName: 'receiptId',
        KeyType: 'RANGE',
      }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'DateIndex',
        KeySchema: [
          {
            AttributeName: 'userId',
            KeyType: 'HASH',
          },
          {
            AttributeName: 'date',
            KeyType: 'RANGE',
          }
        ],
        Projection: {
          ProjectionType: 'ALL',
        },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5,
        },
      }
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5,
    },
  });

  try {
    const response = await client.send(command);
    console.log('Table created successfully:', response);
  } catch (error) {
    if ((error as any).name === 'ResourceInUseException') {
      console.log('Table already exists');
    } else {
      console.error('Error creating table:', error);
      throw error;
    }
  }
}

// Create all tables
async function createAllTables() {
  await createUsersTable();
  await createUserSettingsTable();
  await createReceiptsTable();
}

createAllTables().catch(console.error);
