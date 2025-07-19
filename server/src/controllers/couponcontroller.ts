import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { prisma } from "../server";
export const createCoupon=async(req:AuthenticatedRequest,res:Response):Promise<void>=>{
try{
    const userId=req.user?.userId;
    const role=req.user?.role;
    if(!userId||role=='USER')
    {
        res.status(401).json({
            message:"unauthorized to create coupon"
        })
        return;
    }
    const{code,discountPercent,startdate,enddate,usageLimit}=req.body;
    const newlyCreatedCoupon=await prisma.coupon.create({
        data:{
            code,
            discountPercent:parseInt(discountPercent),
            startdate:new Date(startdate),
            enddate:new Date(enddate),
            usageLimit:+usageLimit,
            usageCount:0,
        }
    });
    res.status(200).json({
        message:" created coupon",
        coupon:newlyCreatedCoupon
    })
}catch(e){
res.status(500).json({
    message:"Failed to create coupon",
    error:e
})
}
}
export const fetchallcoupons=async(req:AuthenticatedRequest,res:Response):Promise<void>=>{
    try{
const fetchallCoupons=await prisma.coupon.findMany({
    orderBy:{createdAt:"asc"}
})
res.status(200).json({
    message:"Fetched all coupons",
    coupons:fetchallCoupons
})
    }catch(e){
res.status(500).json({
    message:"failed to fetch all coupon list"
})
    }
}
export const deletecoupon=async(req:AuthenticatedRequest,res:Response)=>{
    try{
         const userId=req.user?.userId;
    const role=req.user?.role;
    if(!userId||role=='USER')
    {
        res.status(401).json({
            message:"unauthorized to create coupon"
        })
        return;
    }
        const {id}=req.params;
        await prisma.coupon.delete({
            where:{id},
        })
        res.status(201).json({
            message:"coupon deleted succesfuuly",
            id:id,
        })
    }
    catch(e){
        res.status(500).json({
            success:false,
            message:"Failed to delete coupon",
        });

    }
}