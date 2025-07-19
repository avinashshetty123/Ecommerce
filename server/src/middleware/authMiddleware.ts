import { NextFunction,Request,Response } from "express";
import { jwtDecrypt,JWTPayload, jwtVerify } from "jose";
export interface AuthenticatedRequest extends Request{
    user?:{
        userId:String,
        email:String,
        role:String;
    };

}
export const authenticateJwt=(req:AuthenticatedRequest,res:Response,next:NextFunction)=>{
    const accessToken=req.cookies.accessToken;
    if(!accessToken)
    {
        res.status(401).json({error:"access token is not present"});
        return;
    }
    jwtVerify(accessToken,new TextEncoder().encode(process.env.JWT_SECRET)).then((res)=>{
        const payload=res.payload as JWTPayload&{
            userId:string;
            email:string;
            role:string;
        }
        req.user={
            userId:payload.userId,
            email:payload.email,
            role:payload.role,
        }
        next();

    }).catch(e=>{
        console.error(e);
        res.status(401).json({
            success:false,
            error:"Access Token is not present"
        })
    })
}
export const isSuperAdmin=(req:AuthenticatedRequest,res:Response,next:NextFunction)=>{
    if(req.user&&req.user.role=="SUPER_ADMIN")
    {
        next();
    }else{
        res.status(403).json({
            success:false,
            error:"Access Dennied !SuperAdmin access Required"
        })
    }
}