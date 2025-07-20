import { PrismaClient } from "@prisma/client";
import dotenv from 'dotenv';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import authRoutes from './routes/authroutes';
import productRoutes from './routes/productroutes';
import addressRoutes from './routes/addressroutes';
import orderRoutes from './routes/orderroutes';
import cartRoutes from './routes/cartroutes';
import couponRoutes from './routes/couponroutes';
import settingRoutes from './routes/settingroutes'
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
app.use('/api/auth',authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/address', addressRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/coupon', couponRoutes);
app.use('/api/settings', settingRoutes);
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