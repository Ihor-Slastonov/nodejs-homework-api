const Joi = require('joi');

const contactsAddJoiSchema = Joi.object({
  name: Joi.string().min(1).max(30).required(),
  email: Joi.string()
    .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } })
    .required(),
  phone: Joi.string().min(1).max(30).required(),
  favorite: Joi.boolean(),
});

const contactsJoiUpdateSchema = Joi.object({
  name: Joi.string().min(1).max(30).optional(),
  email: Joi.string()
    .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } })
    .optional(),
  phone: Joi.string().min(1).max(30).optional(),
  favorite: Joi.boolean(),
});

const contactJoiFavoriteSchema = Joi.object({
  favorite: Joi.boolean().required(),
});

module.exports = {
  contactsAddJoiSchema,
  contactsJoiUpdateSchema,
  contactJoiFavoriteSchema
};
