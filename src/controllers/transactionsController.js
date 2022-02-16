import db from "../db.js";
import dayjs from "dayjs";
import joi from "joi";


export async function getTransactions (req,res) {
    const { user } = res.locals;

    try{
        const objectShouldSend = {
            name: user.name,
            recordTransaction: user.recordTransaction
        }
        res.send(objectShouldSend);
        }
    catch (error) {
        res.sendStatus(500).send(error);
    }
};

export async function postTransactions (req, res){
    const newTransaction = req.body;
    const { user } = res.locals;

    newTransaction.time = dayjs().format("MM/DD");

    try {
        const addedTransation = [...user.recordTransaction, newTransaction];
        await db.collection("users").updateOne(
            { _id: user._id } ,
            {$set:
                {"recordTransaction" : addedTransation}
        });

        res.sendStatus(201);
    } catch (error) {
        res.sendStatus(500).send(error);
    }

}