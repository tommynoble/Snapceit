import { DynamoDB } from 'aws-sdk';
import { UserProfile } from '../types/UserProfile';

export class UserProfileService {
  private dynamoDb: DynamoDB.DocumentClient;
  private readonly tableName: string;

  constructor() {
    this.dynamoDb = new DynamoDB.DocumentClient();
    this.tableName = process.env.USER_PROFILE_TABLE_NAME || 'UserProfileTable';
  }

  async createProfile(profile: Omit<UserProfile, 'createdAt' | 'updatedAt'>): Promise<UserProfile> {
    const timestamp = new Date().toISOString();
    const newProfile: UserProfile = {
      ...profile,
      createdAt: timestamp,
      updatedAt: timestamp,
      totalReceiptsScanned: 0,
      totalExpenseAmount: 0,
      storageUsed: 0,
    };

    await this.dynamoDb.put({
      TableName: this.tableName,
      Item: newProfile,
    }).promise();

    return newProfile;
  }

  async getProfile(userId: string, email: string): Promise<UserProfile | null> {
    const result = await this.dynamoDb.get({
      TableName: this.tableName,
      Key: {
        userId,
        email,
      },
    }).promise();

    return result.Item as UserProfile || null;
  }

  async updateProfile(userId: string, email: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    const timestamp = new Date().toISOString();
    const updateExpressions: string[] = [];
    const expressionAttributeNames: { [key: string]: string } = {};
    const expressionAttributeValues: { [key: string]: any } = {};

    Object.entries(updates).forEach(([key, value]) => {
      if (key !== 'userId' && key !== 'email') {
        updateExpressions.push(`#${key} = :${key}`);
        expressionAttributeNames[`#${key}`] = key;
        expressionAttributeValues[`:${key}`] = value;
      }
    });

    expressionAttributeNames['#updatedAt'] = 'updatedAt';
    expressionAttributeValues[':updatedAt'] = timestamp;
    updateExpressions.push('#updatedAt = :updatedAt');

    const result = await this.dynamoDb.update({
      TableName: this.tableName,
      Key: { userId, email },
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    }).promise();

    return result.Attributes as UserProfile;
  }

  async updateProfileImage(userId: string, email: string, imageUrl: string): Promise<void> {
    await this.updateProfile(userId, email, {
      profileImageUrl: imageUrl,
    });
  }

  async updateSubscription(
    userId: string,
    email: string,
    plan: UserProfile['subscriptionPlan'],
    status: UserProfile['subscriptionStatus'],
    endDate: string,
  ): Promise<void> {
    await this.updateProfile(userId, email, {
      subscriptionPlan: plan,
      subscriptionStatus: status,
      subscriptionEndDate: endDate,
    });
  }

  async updateSecuritySettings(
    userId: string,
    email: string,
    twoFactorEnabled: boolean,
    securityQuestions?: UserProfile['securityQuestions'],
  ): Promise<void> {
    await this.updateProfile(userId, email, {
      twoFactorEnabled,
      securityQuestions,
      updatedAt: new Date().toISOString(),
    });
  }

  async deleteProfile(userId: string, email: string): Promise<void> {
    await this.updateProfile(userId, email, {
      accountStatus: 'deleted',
      deletionDate: new Date().toISOString(),
    });
  }

  async getProfilesBySubscriptionPlan(
    plan: UserProfile['subscriptionPlan'],
    status: UserProfile['subscriptionStatus'],
  ): Promise<UserProfile[]> {
    const result = await this.dynamoDb.query({
      TableName: this.tableName,
      IndexName: 'SubscriptionPlanIndex',
      KeyConditionExpression: 'subscriptionPlan = :plan AND subscriptionStatus = :status',
      ExpressionAttributeValues: {
        ':plan': plan,
        ':status': status,
      },
    }).promise();

    return result.Items as UserProfile[];
  }

  async updateStorageUsed(userId: string, email: string, newStorageSize: number): Promise<void> {
    await this.updateProfile(userId, email, {
      storageUsed: newStorageSize,
    });
  }

  async incrementReceiptCount(userId: string, email: string, expenseAmount: number): Promise<void> {
    const profile = await this.getProfile(userId, email);
    if (!profile) return;

    await this.updateProfile(userId, email, {
      totalReceiptsScanned: (profile.totalReceiptsScanned || 0) + 1,
      totalExpenseAmount: (profile.totalExpenseAmount || 0) + expenseAmount,
    });
  }
}
