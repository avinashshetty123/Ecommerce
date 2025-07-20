import axios from 'axios'
import { AuthenticatedRequest } from '../middleware/authMiddleware'
import { prisma } from '../server'
import {v4 as uuidv4} from 'uuid';
import dotenv from 'dotenv';
import { base64url } from 'jose';
import { NextFunction, Response } from 'express';
import { Prisma } from '@prisma/client';
dotenv.config();
const PAYPAL_CLIENT_ID=process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET=process.env.PAYPAL_CLIENT_SECRET;
async function getPayPalAccessToken() {
    const response = await axios.post(
        "https://api-m.sandbox.paypal.com/v1/oauth2/token",
        "grant_type=client_credentials",
        {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: `Basic ${Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString("base64")}`
            }
        }
    );
    return response.data.access_token;
}

export const createOrder = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { items, total } = req.body;
        const access_token = await getPayPalAccessToken();

        const paypalItems = items.map((item: any) => ({
            name: item.name,
            description: item.description || "",
            sku: item.id,
            unit_amount: {
                currency_code: "USD",
                value: item.price.toFixed(2),
            },
            quantity: item.quantity.toString(),
            category: "PHYSICAL_GOODS"
        }));

        const itemtotal = paypalItems.reduce((sum: number, item: any) => {
            return sum + parseFloat(item.unit_amount.value) * parseInt(item.quantity);
        }, 0);

        const response = await axios.post(
            'https://api-m.sandbox.paypal.com/v2/checkout/orders',
            {
                intent: "CAPTURE",
                purchase_units: [
                    {
                        amount: {
                            currency_code: "USD",
                            value: total.toFixed(2),
                            breakdown: {
                                item_total: {
                                    currency_code: "USD",
                                    value: itemtotal.toFixed(2),
                                },
                            },
                        },
                        items: paypalItems,
                    },
                ],
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${access_token}`,
                    "PayPal-Request-Id": uuidv4(),
                },
            }
        );

        res.status(200).json(response.data);
    } catch (e) {
        res.status(500).json({ message: "Error creating order" });
    }
};
export const capturePayPalOrder=async(req:AuthenticatedRequest,res:Response,next:NextFunction):Promise<void>=>
{
    try{
const {orderId}=req.body;
const access_token=await getPayPalAccessToken();
const response=await axios.post(`https://api-m.sandbox.paypal.com/v2/checkout/orders/$orderId}/capture`,
    {},
    {
        headers:{
            "Content-Type":"application/json",
            Authorization:`Bearer${access_token}`,
            },
            
        }
    
)
res.status(200).json(response.data);


    }catch(e){
res.status(500).json({
    message:"Error capturing order"
})
    }
}
export const createFinalOrder=async(req:AuthenticatedRequest,res:Response,next:NextFunction):Promise<void>=>{
    try{
const {items,addressId,couponId,total,paymentId}=req.body;
const userId=req.user?.userId;
console.log(items,"items");
if(!userId)
{
    res.status(401).json({
        message:"UserAuthunitcated",
    })
    return;
}
const order=await prisma.$transacttion(async(prisma:any)=>{
    const neworder=await prisma.order.create({
        date:{
            userId,
            addressId,
            couponId,
            total,
            paymentMethod:"CREDIT_CART",
            paymetnStatus:"COMPLETED",
            paymentId,
            items:{
                create:items.map((items:any)=>({
                    productId:items.productId,
                    productName:items.productName,
                    productCategory:items.productCategory,
                    quantity:items.quantity,
                    price:items.price,
                    color:items.color,

                })),
            },
        },
        include:{
            items:true,
        }
    })
    for(const item of items){
        await prisma.product.update({
            where:{id:item.productId},
            date:
            {
            stock:{decrement:item.quantity},
            soldCount:{increment:item.quantity},
        }
    })
}
await prisma.cartItem.deleteMany({
    where:{
        cart:{userId},
    },
})
await prisma.cart.delete({
    where:{
        userId
    }
})
if(couponId)
    {
    await prisma.coupon.update({
        where:{id:couponId},
        data:{

            usageCount:{increment:1}
        }
    })
}
return neworder;
});
res.status(201).json(order);


    }catch(e){
        console.log(e);
        next(e);

    }
}
export const getOrder=async(req:AuthenticatedRequest,res:Response,next:NextFunction):Promise<void>=>{
    try {
        const userId=req.user?.userId;
        const {orderId}=req.params;
        if(!userId){
            res.status(402).json({
                success:false,
                message:"Unauthorized user",
            })
            return;
        }
        const order=await prisma.order.findFirst({
            where:{
                id:orderId,
                userId,
            },
            include:{
                items:true,
                address:true,
                coupon:true,
            }
        })
        res.status(200).json(order);
    } catch (e) {
        res.status(500).json({
            message:"internal server error",
        })
        
    }
}
export const updateOrderStatus=async(req:AuthenticatedRequest,res:Response,next:NextFunction):Promise<void>=>{
    try {
        const userId=req.user?.userId;
        const {orderId}=req.params;
        const {status}=req.body;
        if(!userId)
        {
            res.status(401).json({
                message:"Unauthorized user",
            })
            return;
        }
        await prisma.order.updateMany({
            where:{
                id:orderId,
            },
            data:{
                status,
            }
        })
        res.status(200).json({
            success:true,
            message:"Order status updated Successfuly",
        })
    } catch (e) {
        res.status(500).json({
            success:false,
            message:"unexpected error occured"
        })
        
    }
}
export const getAllOrderForAdmin=async(req:AuthenticatedRequest,res:Response,next:NextFunction):Promise<void>=>{
    try{
        const userId=req.user?.userId;
        if(!userId){
            res.status(401).json({
                message:"Unauthorized user"
            })
            return;
        }
        const order=await prisma.order.findMany({
     include:{
        items:true,
        address:true,
        user:{
            select:{
                id:true,
                name:true,
                email:true,
            }
        }
    }
})
res.status(200).json(order);
}
            catch(e){
res.status(500).json({
    message:"internal server error"
})
            }}
export const getOrderByid=async(req:AuthenticatedRequest,res:Response,next:NextFunction):Promise<void>=>{
    try{
const userId=req.user?.userId;

if(!userId)
{
    res.status(401).json(
        {
            message:"Unauthenticated"
        }
    )
    return;

}
const order=await prisma.order.findMany({
    where:{
        userId:userId,

    },
    include:{
        items:true,
        address:true,
    },
    orderBy:{
        createdAt:"desc"
    }
})
res.status(200).json(order);
    }catch(e){
        res.status(500).json({
            message:"Unexpeted Error Happeneded"
        })

    }
}