import joi from 'joi';

export function registerValidate(req, res, next) {
    const newUserRegister = req.body;

    const userSchema = joi.object({
    name: joi.string().min(3).max(25).required(),
    email: joi.string().email().required(),
    password: joi.string().min(3).max(9).required()
    });

    const userSchemaValidation = userSchema.validate(newUserRegister, { abortEarly: false });
    if (userSchemaValidation.error) {
        return res.sendStatus(422);
    }

    next();
}