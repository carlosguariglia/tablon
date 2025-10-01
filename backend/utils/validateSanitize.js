// Utilidades para validación y sanitización de inputs
const validator = require('validator');

function sanitizeString(str) {
  if (typeof str !== 'string') return '';
  return validator.escape(str.trim());
}

function validateEmail(email) {
  return validator.isEmail(email);
}

function validatePassword(password) {
  // Mínimo 8 caracteres, al menos una mayúscula, una minúscula y un número
  return validator.isStrongPassword(password, {
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 0
  });
}

function sanitizeObject(obj, fields) {
  const sanitized = {};
  fields.forEach(f => {
    sanitized[f] = sanitizeString(obj[f]);
  });
  return sanitized;
}

module.exports = {
  sanitizeString,
  validateEmail,
  validatePassword,
  sanitizeObject
};
