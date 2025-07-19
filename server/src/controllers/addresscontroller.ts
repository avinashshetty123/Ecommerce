import { Response } from "express";
import { prisma } from '../server'
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { isDefaultClause } from "typescript";
export const createAddress=async(
    req:AuthenticatedRequest,
    res:Response
):Promise<void>=>{
    try{

        const userId=req.user?.userId;
        if(!userId){
            res.status(400).json({
                message:"Unauthenticated user",
                succes:false,
            })
            return;
        }
        const {name,address,city,country,postaladdress,phone,isDefault}=req.body;
        if(!isDefault){
            await prisma.address.updateMany({
                where:{userId},
                data:{
                    isDefault:false,
                },
            });
        }
        const newUseraddress=await prisma.address.create({
            data:{
                userId,
                name,
                address,
                city,
                country,
                postaladdress,
                phone,
                isDefault:isDefault||false,
            
            }
        })
    }catch(e){
        res.status(400).json({
            success:false,
            error:e,
        })
    }
}
export const getAddress=async(req:AuthenticatedRequest,res:Response):Promise<void>=>{
try{
    const userId=req.user?.userId;
    if(!userId)
    {
        res.status(401).json({
            message:"Unauthenticated"
        })
        return;
    }
    const fetchallAddress=await prisma.address.findMany({
        where:{userId},
        orderBy:{createdAt:"desc"},
    })
    res.status(200).json({
        address:fetchallAddress,
        success:true
    })

}
catch(e){
    res.status(400).json({
        success:false,
        error:e,
    })
}}
export const updateaddress=async(req:AuthenticatedRequest,res:Response):Promise<void>=>{
try{
    const userId=req.user?.userId;
    const {id}=req.params;
    if(!userId)
    {
        res.status(401).json({
            message:"Unauthenticated"
        })
        return;
    }
    const exisiinguser=await prisma.address.findFirst({
        where:{id,userId},
    });
    if(!exisiinguser)
    {
        res.status(404).json({
            message:"Address not found"
        })
        return;
    }
    const {name,address,city,country,postaladdress,phone,isDefault}=req.body;
    if(!isDefault)
    {
        await prisma.address.updateMany({
            where:{userId},
            data:{
                isDefault:false,
            }
        })
    }
    const newUpdatedAddress=await prisma.address.update({
        where:{id},
        data:{
            name,
            address,
            city,
            country,
            postaladdress,
            phone,
            isDefault:isDefault||false,
        }
    })
    res.status(200).json({
        address:newUpdatedAddress
    })
    
}
catch(e){
    res.status(400).json({
        success:false,
        error:e,
    })
}}

export const deleteAddress=async(req:AuthenticatedRequest,res:Response):Promise<void>=>{
    try{
        const {id}=req.params;
        const userId=req.user?.userId;
        if(!userId)
        {
            res.status(400).json({
                message:"Unauthorized"
            })
            return;
        }
        const exisitingaddress=await prisma.address.findFirst(
            {
                where:{id,userId}
            }
        )
        if(!exisitingaddress )
        {
            res.status(402).json({
                message:"address not found"
            })
            return;
        }
        await prisma.address.delete({
            where:{id},        })
res.status(200).json({
    message:"Address Deleted SuccessFully",
})
    }catch(e){
        res.status(400).json({
            success:false,
            error:e,
        })

    }
}