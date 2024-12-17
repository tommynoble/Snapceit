import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as cdk from 'aws-cdk-lib';
import { RemovalPolicy } from 'aws-cdk-lib';

export class UserProfileTable extends cdk.Stack {
  public readonly table: dynamodb.Table;

  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create the DynamoDB table
    this.table = new dynamodb.Table(this, 'UserProfileTable', {
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'email', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.RETAIN,
      pointInTimeRecovery: true,

      // Global Secondary Indexes
      globalSecondaryIndexes: [
        {
          indexName: 'EmailIndex',
          partitionKey: { name: 'email', type: dynamodb.AttributeType.STRING },
          projectionType: dynamodb.ProjectionType.ALL,
        },
        {
          indexName: 'SubscriptionPlanIndex',
          partitionKey: { name: 'subscriptionPlan', type: dynamodb.AttributeType.STRING },
          sortKey: { name: 'subscriptionStatus', type: dynamodb.AttributeType.STRING },
          projectionType: dynamodb.ProjectionType.INCLUDE,
          nonKeyAttributes: ['userId', 'email', 'subscriptionEndDate'],
        },
      ],
    });

    // Add TTL for deleted accounts
    this.table.addGlobalSecondaryIndex({
      indexName: 'DeletedAccountsIndex',
      partitionKey: { name: 'accountStatus', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'deletionDate', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.INCLUDE,
      nonKeyAttributes: ['userId', 'email'],
    });

    // Enable server-side encryption
    this.table.encryptionKey;

    // Add auto-scaling
    const readScaling = this.table.autoScaleReadCapacity({
      minCapacity: 1,
      maxCapacity: 100,
    });

    readScaling.scaleOnUtilization({
      targetUtilizationPercent: 75,
    });

    // Output the table name and ARN
    new cdk.CfnOutput(this, 'TableName', {
      value: this.table.tableName,
      description: 'User Profile Table Name',
    });

    new cdk.CfnOutput(this, 'TableArn', {
      value: this.table.tableArn,
      description: 'User Profile Table ARN',
    });
  }
}
