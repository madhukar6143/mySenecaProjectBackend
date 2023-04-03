const Joi = require('joi');


const validateCredentials = (username,password) => {
    const usernameSchema = Joi.string().alphanum().min(8).max(16).required();
    const passwordSchema = Joi.string()
                               .min(8)
                               .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\\$%\\^&\\*])(?=.{8,})'))
                               .required()
                               .error(new Error('Password must contain at least 8 characters, including uppercase and lowercase letters, numbers, and special characters'));
                               ;
    const usernameValidation= usernameSchema.validate(username);
    if(usernameValidation.error)
    return usernameValidation.error;
    const passwordValidation= passwordSchema.validate(password);
    if(passwordValidation.error)
    return passwordValidation.error;
    return false;
};

module.exports=validateCredentials