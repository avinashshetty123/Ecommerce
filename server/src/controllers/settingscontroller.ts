import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import cloudinary from "../config/cloudinary";
import {prisma} from '../server'
import fs from 'fs'
import { upload } from "../middleware/uploadmiddleware";
import { getOrder } from "./ordercontroller";
export const addFeatureBanner=async(req:AuthenticatedRequest,res:Response):Promise<void>=>{
    try{
const files=req.files as Express.Multer.File[];
if(!files||files.length==0)
{
    res.status(404).json({
        success:false,
        message:"No files uploaded"
    });
    return;
}
const uploadPromises=files.map((file)=>
    
        cloudinary.uploader.upload(file.path,{
            folder:"ecommere-banners"
        })
    
);
const uploadresults=await Promise.all(uploadPromises);
const banners=await Promise.all(
    uploadresults.map((res)=>{
    prisma.featureBanner.create({
        data:{
            imageUrl:res.secure_url,
            publicId:res.public_id,
        }
    })
}));
files.forEach((file)=>fs.unlinkSync(file.path));
res.status(201).json({
    banners
})
    }catch(e){
console.error(e);
res.status(500).json({
    success:false,
    message:"Failed to add Feature Banners"
})
    }
}
export const fetchFeatureBanner=async(req:AuthenticatedRequest,res:Response):Promise<void>=>{
try{

    const banners=await prisma.featureBanner.findMany({
        orderBy:{createdAt:"desc"},
    });
    res.status(200).json({
        success:true,
        banners,
    })
}catch(e){
    console.error(e);
    res.status(500).json({
        success:false,
        message:"Failed to fetch Feature Banners"
    })
}

}
export const updateFeatureBanner=async(req:AuthenticatedRequest,res:Response):Promise<void>=>{
    try{
        const {productId}=req.body;
        if(!Array.isArray(productId)||productId.length>8)
        {
            res.status(400).json({
                message:"invalid ID"
            })
            return;
        }
        await prisma.product.updateMany({
            data:{isFeatured:false},
        })
        await prisma.product.updateMany({
            where:{
                id:{in:productId}
            },
            data:{isFeatured:true}
        })
        res.status(400).json({
            message:"featured products updated succesfuly"
        })

    }catch(e)
    {
        res.status(500).json({
            success:false,
            message:"Failed to update Feature Banners"
        })

    }
}
export const getFeaturedProducts=async(req:AuthenticatedRequest, res:Response):Promise<void>=>{
try{
   const featuredProducts=await prisma.featureBanner.findMany({
    where:{
        isFeatured:true
    }
   })
    res.status(200).json({
        success:true,
        featuredProducts,
    })
}catch(e){
    console.error(e);
    res.status(500).json({
        success:false,
        message:"Failed to fetch Feature Banners"
    })
}}
