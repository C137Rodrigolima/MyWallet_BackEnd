import db from "../db.js";
import dayjs from "dayjs";
import joi from "joi";


export async function getTransactions (req,res) {
    const { authorization } = req.headers;
    const token = authorization?.replace('Bearer ', '');

    if(!token) {
        return res.sendStatus(401)
    };

    try {
        const session = await db.collection("sessions").findOne({ token });  
    if (!session) {
        return res.sendStatus(404);
    }

    const user = await db.collection("users").findOne({ _id: session.userId });
    if(!user) {
        res.sendStatus(404);
    }

    const objectShouldSend = {
        name: user.name,
        recordTransaction: user.recordTransaction
    }
    res.send(objectShouldSend);
    }

    catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
};

export async function postTransactions (req, res){
    const newTransaction = req.body; // value, description, type
    const { authorization } = req.headers;
    const token = authorization?.replace('Bearer ', '');

    if(!token) {
        return res.sendStatus(401);
    }

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
        console.log(transacionSchemaValidation.error.details);
        res.sendStatus(422);
        return;
    }

    const replacer = (dayjs().format("MM-DD")).replace("-", "/");
    newTransaction.time = replacer;

    try {
        const session = await db.collection("sessions").findOne({ token });  
        if (!session) {
            return res.sendStatus(401);
        }
        const user = await db.collection("users").findOne({ _id: session.userId });
        if(!user) {
            return res.sendStatus(404);
        }
        const addedTransation = [...user.recordTransaction, newTransaction];
        await db.collection("users").updateOne(
            { _id: user._id } ,
            {$set:
                {"recordTransaction" : addedTransation}
        });

        res.sendStatus(201);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }

}