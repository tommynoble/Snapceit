import Joi from 'joi';

export const updateUserSchema = Joi.object({
  firstName: Joi.string().min(2).max(255),
  lastName: Joi.string().min(2).max(255),
  accountStatus: Joi.string().valid('active', 'inactive'),
  emailVerified: Joi.boolean()
});

export const updateSettingsSchema = Joi.object({
  notificationEmail: Joi.boolean(),
  notificationPush: Joi.boolean(),
  notificationSms: Joi.boolean(),
  preferredCurrency: Joi.string().length(3),
  language: Joi.string().length(2),
  timezone: Joi.string(),
});
