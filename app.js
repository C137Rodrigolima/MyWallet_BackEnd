import Express, { json } from "express";
import {MongoClient} from 'mongodb';
import cors from "cors";
import dayjs from "dayjs";
import dotenv from "dotenv";
import joi from "joi";
import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
dotenv.config();

const mongoClient = new MongoClient(process.env.MONGO_URI);
let db;
mongoClient.connect(() => {
    db = mongoClient.db("my_wallet_back");
});

const server = Express();
server.use(cors());
server.use(json());

server.post("/sign-up", async (req, res)=> {
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
})

server.post("/", async (req, res)=> {
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
});

server.get("/transaction-record", async (req,res) => {
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
});

server.post("/sendTransaction", async (req, res)=>{
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

})

server.listen(5000, ()=>{
    console.log("Listening on port 5000")
});