import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import db from '../db.js';
import joi from 'joi';

export async function signUp(req, res) {
    const userData = req.body; // name, email, password

    const userSchema = joi.object({
        name: joi.string().required(),
        email: joi.string().email().required(),
        password: joi.string().required()
    });

    const userSchemaValidation = userSchema.validate(userData, { abortEarly: false });
    if (userSchemaValidation.error) {
        console.log(userSchemaValidation.error.details);
        res.sendStatus(422);
        return;
    }

    userData.recordTransaction = [];
    const passwordHash = bcrypt.hashSync(userData.password, 10);
    try {
        await db.collection('users').insertOne({ ...userData, password: passwordHash });
        res.sendStatus(201); //created
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
};

export async function signIn (req, res) {
    const userData = req.body;

    const userSchema = joi.object({
        email: joi.string().email().required(),
        password: joi.string().required()
    });

    const userSchemaValidation = userSchema.validate(userData, { abortEarly: false });
    if (userSchemaValidation.error) {
        console.log(userSchemaValidation.error.details);
        res.sendStatus(422);
        return;
    }

    try {
        const user = await db.collection('users').findOne({ email: userData.email });
    
        if(!user){
            return res.sendStatus(404); //notFound
        }
        if(!bcrypt.compareSync(userData.password, user.password)) {
            return res.sendStatus(401) //Unauthorized
        }

        const token = uuid();
        await db.collection("sessions").insertOne({
            userId: user._id,
            token
        })

        res.send(token);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
};