import { PrismaClient } from "@prisma/client";
import dotenv from 'dotenv';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
dotenv.config();
const app=express();
app.use(express.json());
app.use(cookieParser());
const PORT=process.env.PORT||3000;
const corsOptions={
    origin:"http://localhost:3000",
    Credential:true,
    method:["GET","POST","PUT","DELETE","OPTIONS"],
    allowedHeader:["Content-Type","Authorization"],
}
app.use(cors(corsOptions));
export const prisma =new PrismaClient();
app.get('/',(req,res)=>{
    res.send("hello from ecommerce");
})
app.listen(PORT,()=>{
    console.log(`the server started at http:/localhost/${PORT}/`);
})
process.on("SIGINT",async()=>{
    await prisma.$disconnect();
    process.exit();
})