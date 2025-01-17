const Joi = require('joi');

const usersRegJoiSchema = Joi.object({
  password: Joi.string().min(6).required(),
  email: Joi.string()
    .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } })
    .required(),
  subscription: Joi.string(),
  token: Joi.string().optional,
});

const usersLoginJoiSchema = Joi.object({
  email: Joi.string()
    .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } })
    .required(),
  password: Joi.string().min(6).required(),
});

const usersUpdateSubsriptionJoiSchema = Joi.object({
  subscription: Joi.string().valid('starter', 'pro', 'business').required(),
});

const usersVerifyEmailJoiSchema = Joi.object({
  email: Joi.string()
    .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } })
    .required(),
});

module.exports = {
  usersRegJoiSchema,
  usersLoginJoiSchema,
  usersUpdateSubsriptionJoiSchema,
  usersVerifyEmailJoiSchema
};
