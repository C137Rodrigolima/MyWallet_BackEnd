import Express, { json } from "express";
import MongoClient from 'mongodb';
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const mongoClient = new MongoClient(process.env.MONGO_URI);
let db;
mongoClient.connect(() => {
    db = mongoClient.db("my_wallet_back");
});

const server = Express();
server.use(json());
server.use(cors());


server.listen(5000, ()=>{
    console.log("Lintening on port 5000")
});