import joi from 'joi';

export function loginValidate(req, res, next) {
    const newUserRegister = req.body;

    const userSchema = joi.object({
    email: joi.string().email().required(),
    password: joi.string().min(3).max(9).required()
    });

    const userSchemaValidation = userSchema.validate(newUserRegister, { abortEarly: false });
    if (userSchemaValidation.error) {
        return res.sendStatus(422);
    }

    next();
}