import {v4 as uuidv4} from 'uuid';
import argon2 from "argon2";
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv';
import {Request,Response} from "express";
import { prisma } from '../server';
function generateToken(userID:string,email:string,role:string)
{
    const accessToken=jwt.sign({
        userID,
        email,
        role,
    },
    process.env.ACCESSTOKEN!,
    {expiresIn:"1d"}
);
const refreshtoken=uuidv4();
return {accessToken,refreshtoken};
}
async function setToken(res:Response,accessToken:string,refreshtoken:string) {
    res.cookie("accessToken",accessToken,{
        httpOnly:true,
        secure:process.env.NODE_ENV=="production",
        sameSite:"strict",
        maxAge:60*60*1000,
    })
    res.cookie("refreshToken",refreshtoken,{
        httpOnly:true,
        secure:process.env.NODE=="production",
        sameSite:"strict",
        maxAge:30*24*60*60*1000,
    })
await prisma.user.update({
  where: { id: prisma.user.id },
  data: { refreshToken:refreshtoken },
});

}
export const register=async(req:Request,res:Response):Promise<void>=>{
try{
    const {name,email,password}=req.body;
    const existingUser=await prisma.user.findUnique({
        where:{email}
    })
    if(existingUser)
    {
         res.status(400).json({error:"User already exists"});
         return;
    }
    const hashedPassword=await argon2.hash(password);
    const newuser=await prisma.user.create({
        data:{
            name,
            email,
        password:hashedPassword,
    role:"USER",
        },
    })
    res.status(200).json({
        message:"User Resgistered Succesfully",
        sucess:true,
        userId:newuser.id,
    })


}catch(e)
{
console.log(`the error is ${e}`);
res.status(500).json({message:"Internal server error"});
}
}
export const login =async(req:Request,res:Response):Promise<void>=>{
try {
    const {email,password}=req.body;
    const extractuser=await prisma.user.findUnique({
        where:{email},
    })
    if(!extractuser||await argon2.verify(extractuser.password,password))
    {
        res.status(400).json({
            error:"User dont exist Please Register First",
            success:false,
        })
        return;
    }
    
    const {accessToken,refreshtoken}=generateToken(extractuser.id,extractuser.email,extractuser.role);
    await setToken(res,accessToken,refreshtoken);

    res.status(200).json({
        message:"User logged in succesfully",
        success:true,
        accessToken,
        refreshtoken,
        user:{
            id:extractuser.id,
            name:extractuser.name,
            email:extractuser.email,
            role:extractuser.role,
        }
    })


    
} catch (error) {
    console.log(`the error is ${error}`);
    res.status(500).json({message:"Internal server error"});
}}
export const refreshAccesstoken=async(req:Request,res:Response):Promise<void>=>{
const refreshtoken=req.cookies.refreshtoken;
if(!refreshtoken)
{
    res.status(401).json({error:"Unauthorized"});
}
try{
const user=await prisma.user.findFirst({
    where:{
        refreshToken:refreshtoken,
    }
});
if(!user)
{
    res.status(401).json({error:"Unauthorized"});
    return;
}
const {accessToken,refreshtoken:newRefreshToken}=generateToken(
    user.id,
    user.email,
    user.role
)
setToken(res,accessToken,newRefreshToken);
res.status(200).json({
    succes:true,
    message:"RefreshToken Refreshed Succesfuully",
})
}catch(e)
{
    console.log(`${e}`);
    res.status(500).json({
        message:"internal server problem"
    })

}

}

export const logout=async(req:Request,res:Response):Promise<void>=>{
    res.clearCookie('refreshtoken');
    res.clearCookie('accessToken');
    res.json({
        success:true,
        message:"User logged out sucessfully"
    })
}
