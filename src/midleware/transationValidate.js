import joi from 'joi';

export function transationValidate(req, res, next) {
    const newTransaction = req.body;

    const transacionSchema = joi.object({
        value: joi.string().required(),
        description: joi.string().required(),
        type: joi.boolean().required()
    });

    const transacionSchemaValidation = transacionSchema.validate(
        newTransaction, 
        { abortEarly: false }
    );
    if (transacionSchemaValidation.error) {
        return res.sendStatus(422);
    }

    next();
}