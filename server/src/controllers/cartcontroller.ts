import { response, Response } from "express";
import { AuthenticatedRequest, authenticateJwt } from "../middleware/authMiddleware";
import {prisma} from "../server";
export const addTocart=async(
    req:AuthenticatedRequest,
    res:Response
):Promise<void>=>{
    try{
        const userId=req.user?.userId;
        const {productId,quantity,size,color}=req.body;
        if(!userId)
        {
            res.status(401).json({
                message:"unauthorized!"
            })
            return;
        }
        const cart=await prisma.cart.upsert({
            where:{userId},
            create:{userId},
            update:{},
        })
        const cartItem=await prisma.cartItem.upsert({
            where:{
            cartId_productId_size_color:{
                cartId:cart.id,
                productId,
                size:size||null,
                color:color||null,
            },
            },
            update:{
                quantity:{increment:quantity},
            },
            create:{
                cartId:cart.id,
                productId,
                quantity,
                size,
                color,

            },
        })
        const product=await prisma.product.findUnique({
            where:{id:productId},
            select:{
                name:true,
                price:true,
                images:true,
            }
        })
        const responseItem={
            id:cartItem.id,
            productId:cartItem.productId,
            name:product?.name,
            price:product?.price,
            image:product?.images[0],
            size:cartItem.size,
            color:cartItem.color,
            quantity:cartItem.quantity,
        }
        res.status(200).json({
            data:responseItem,
        })


    }catch(e){
        console.log(e);
        res.status(500).json({
            message:"Internal server error"
        })
    }
}
export const getCart=async(req:AuthenticatedRequest,res:Response):Promise<void>=>{
    try{
        const userId=req.user?.userId;
        if(!userId)
        {
            res.status(401).json({
                message:"Unauthorized"
            })
            return;
        }
        const cart=await prisma.cart.findUnique({
            where:{userId},
            include:{
                items:true,     
            }
        })
if(!cart)
{
    res.status(404).json({
        message:"Cart not found"
    })
    return;
}
const cartItemswithProducts=await Promise.all(cart?.items.map(async(item:any)=>{
    const product=await prisma.product.findUnique({
        where:{id:item.productId},
        select:{
            name:true,
            price:true,
            images:true,
        }
    });
    return {
        id:item.id,
        productId:item.productId,
        name:product?.name,
        price:product?.price,
        images:product?.images[0],
        color:item.color,
        size:item.size,
        quantity:item.quantity,
    }
}))
res.status(200).json({
    data:cartItemswithProducts
})
    }catch(e){
           console.log(e);
        res.status(500).json({
            message:"Internal server error"
        })
    }
}
export const removefromcart=async(
    req:AuthenticatedRequest,
    res:Response
):Promise<void>=>{
    try{
const userId=req.user?.userId;
const {id}=req.params;
if(!userId)
{
    res.status(401).json({
        message:"UNAUTHORIZED"
    })
    return;
}
await prisma.cartItem.delete({
    where:{
        id,cart:{userId},
    }
});
res.status(200).json({
    message:"Item removed from cart successfully"
})
    }catch(e){
res.status(500).json({
    success:false,
    mesage:"Failed to delete cart"
})

    }
}
export const updateCartItems=async(req:AuthenticatedRequest,res:Response)=>{
    try{
const userId=req.user?.userId;
const {id}=req.params;
const {quantity}=req.body;
if(!userId)
{
    res.status(402).json({
        message:"UNAUTHORIZED",
    })
    return;
}
const updatedItem=await prisma.cartItem.update({
    where:{id,
        cart:{userId},
    },
    data:{quantity},
});
const product=await prisma.product.findUnique({
    where:{id:updatedItem.productId},
    select:{
        name:true,
        price:true,
        images:true,
    }
})
const responseItem={
    id:updatedItem.id,
    productId:updatedItem.productId,
    name:product?.name,
    price:product?.price,
    images:product?.images[0],
    color:updatedItem.color,
    size:updatedItem.size,
    quantity:updatedItem.quantity,
}
res.json({
    data:responseItem,
})
    }catch(e){
        res.status(400).json({
            message:"Coundnt update the items"
        })

    }
}
export const clearCart=async(req:AuthenticatedRequest,res:Response):Promise<void>=>{
   try{

       const userId=req.user?.userId;
       if(!userId)
    {res.status(401).json({
        message:"Unauthorized"
    })
        return;
    }
    await prisma.cartItem.deleteMany({
        where:{
            cart:{userId},
        }
    })
    res.status(200).json({
        message:"Cart cleared Successfully"
    }
    )
}catch(e){
        res.status(500).json({
      success: false,
      message: "Failed to clear cart!",
    });
}
       }