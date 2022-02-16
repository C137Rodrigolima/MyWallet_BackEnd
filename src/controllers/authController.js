import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import db from '../db.js';
import joi from 'joi';

export async function signUp(req, res) {
    const userData = req.body;

    const existentUser = await db.collection('users').findOne({ email: userData.email });
    if(existentUser){
        return res.sendStatus(401);
    }

    userData.recordTransaction = [];
    const passwordHash = bcrypt.hashSync(userData.password, 10);
    try {
        await db.collection('users').insertOne({ ...userData, password: passwordHash });
        res.sendStatus(201);
    } catch (error) {
        res.sendStatus(500).send(error);
    }
};

export async function signIn (req, res) {
    const userData = req.body;

    try {
        const user = await db.collection('users').findOne({ email: userData.email });
    
        if(!user){
            return res.sendStatus(404);
        }
        if(!bcrypt.compareSync(userData.password, user.password)) {
            return res.sendStatus(401);
        }

        const token = uuid();
        await db.collection("sessions").insertOne({
            userId: user._id,
            token
        })

        res.send(token);
    } catch (error) {
        res.sendStatus(500);
    }
};