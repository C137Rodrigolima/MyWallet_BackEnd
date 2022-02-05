import Express, { json } from "express";
import {MongoClient} from 'mongodb';
import cors from "cors";
import dotenv from "dotenv";
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
    const userData = req.body; // nome, email, senha
    const passwordHash = bcrypt.hashSync(userData.password, 10);
    try {
        await db.collection('users').insertOne({ ...userData, password: passwordHash });
        res.sendStatus(201);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})

server.post("/", async (req, res)=> {
    const { email, password } = req.body;
    try {
        const user = await db.collection('users').findOne({ email });
    
        if(user && bcrypt.compareSync(password, user.password)) {
            const token = uuid();
            await db.collection("sessions").insertOne({
                userId: user._id,
                token
            })

            res.send(token);
        } else {
            res.sendStatus(401);
            //usuário não encontrado (email ou senha incorretos)
        }
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
        return res.sendStatus(401);
    }
    const user = await db.collection("users").findOne({ _id: session.userId });
    if(user) {
      res.send("response with token validation working alright!!! Just put the others data in new collections...")
    } else {
      res.sendStatus(401);
    }
        
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

server.listen(5000, ()=>{
    console.log("Listening on port 5000")
});