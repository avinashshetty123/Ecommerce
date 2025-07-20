import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import cloudinary from "../config/cloudinary";
import { prisma } from "../server";
import fs from "fs";
import { Prisma ,PrismaClient} from "@prisma/client";
import { upload } from "../middleware/uploadmiddleware";
import { parseArgs } from "util";
export const createProduct=async(req:AuthenticatedRequest,res:Response):Promise<void>=>{
    try{
const{name,brand,description,category,gender,sizes,colors,price,stock}=req.body;
const files=req.files as Express.Multer.File[];
const uploadPromises=files.map((file)=>
    cloudinary.uploader.upload(file.path,{
        folder:"ecommerce",
    })
)
const uploadresults=await Promise.all(uploadPromises);
const imageUrls=uploadresults.map((result)=>({
    url:result.secure_url,
    public_id:result.public_id
}));
const newCreatedProduct=await prisma.product.create({
    data:{
        name,
        brand,
        category,
        description,
        gender,
        sizes:sizes.split(","),
        colors:colors.split(","),
        price:parseFloat(price),
        stock:parseInt(stock),
        images:imageUrls,
        soldCount:0,
        rating:0,

    }
})
files.forEach((file)=>fs.unlinkSync(file.path));
res.status(200).json(newCreatedProduct);

    }catch(e)
    {
        console.error(e);
        res.status(500).json({
            message:"Something went wrong"
        })

    }
}
export const fetchallProductsForAdmin=async(req:AuthenticatedRequest,res:Response):Promise<void>=>{
    try{
        const fetchallProducts=await prisma.product.findMany();
        res.status(200).json(fetchallProducts);

    }
    catch(e)
    {
        console.error(e);
        res.status(500).json({
            message:"something went wrong"
        })
    }
}
export const getProductById=async(req:AuthenticatedRequest,res:Response):Promise<void>=>{
    try{
const {id}=req.params;
const product=await prisma.product.findUnique({
    where:{id},
})
if(!product){
    res.status(404).json({
        message:"Product not found"
    } );
}
res.status(200).json(product);
    }catch(e)
    {  console.error(e);
        res.status(500).json({
            message:"something went wrong"
        })

    }
}
export const updateProduct=async(req:AuthenticatedRequest,res:Response):Promise<void>=>{
    try{
const{id}=req.params;
const{
    name, brand,description,category,gender,sizes,colors,price,stock,rating}=req.body;
    console.log(req.body);
    const exisitingProduct=await prisma.product.findUnique({
        where:{
            id
        }
    })
    if(!exisitingProduct){
        res.status(404).json({
            message:"Product not found"
        })
        return;
    }
    if(exisitingProduct.images&&Array.isArray(exisitingProduct.images)){
        for (const img of exisitingProduct.images) {
            if (img.public_id) {
                await cloudinary.uploader.destroy(img.public_id);
            }
        }
    }
    const files=req.files as Express.Multer.File[];
    
    const uploadPromises=files.map((file)=>
        cloudinary.uploader.upload(file.path,{
            folder:"ecommerce",
        }))
        const uploadresults=await Promise.all(uploadPromises);
    for(const file of files){
        await fs.unlinkSync(file.path);
    }
        const imageUrls=uploadresults.map((res)=>({
            url:res.secure_url,
            public_id:res.public_id,
    }))

    const product =await prisma.product.update({
        where:{id},
        data:{
            name,
            brand,
            category,
            description,
            gender,
            sizes:sizes.split(","),
            colors:colors.split(","),
            price:parseFloat(price),
            stock:parseFloat(stock),
            rating:parseInt(rating),
            images:imageUrls
        }
    })
    res.status(200).json(product);
    
    }catch(e){
        console.error(e);
        res.status(500).json(
            {
                message:"some error occured"
            }
        )

    }
}
export const deleteProduct=async(req:AuthenticatedRequest,res:Response):Promise<void>=>{
    try{
const {id}=req.params;
const existingProduct=await prisma.product.findUnique({
    where:{id},
})
if(!existingProduct){
    res.status(404).json({
        message:"Product not found"
    })
    return;
}
if(existingProduct.images&&Array.isArray(existingProduct.images)){
    for(const img of existingProduct.images){
        if(img.public_id){
            await cloudinary.uploader.destroy(img.public_id);
        }
    }
}
await prisma.product.delete({
    where:{id},
})
res.status(200).json({
    message:"Product deleted successfully"
})
    }catch(e){
        console.error(e);
        res.status(500).json({
            message:"something went wrong"
        })
    }
}
export const getProductsForClients=async(req:AuthenticatedRequest,res:Response):Promise<void>=>{
    try{
        const page=parseInt(req.query.page as string )||1;
        const limit=parseInt(req.query.limit as string )||10;
        const category=((req.query.category as string)||" ").split(",").filter(Boolean);
        const brands=((req.query.brands as string)||" ").split(",").filter(Boolean);
        const sizes=((req.query.sizes as string)||" ").split(",").filter(Boolean);
        const colors=((req.query.colors as string)||" ").split(",").filter(Boolean);
        const minPrice =(parseFloat(req.query.minPrice as string)||0)
        const maxPrice=(parseFloat(req.query.maxPrice as string )||Number.MAX_SAFE_INTEGER)
        const sortBy=(req.query.sortBy as string)||"createdAt";
        const sortOrder=(req.query.sortOrder as "asc"|
            "desc")||"desc";
            const skip=(page-1)*limit;
            const where:Prisma.ProductWhereInput={
                AND:[
                    category.length>0?{
                        category:{
                            in:category,
                            mode:"insensitive",
                        }
                    }:{},
                    brands.length>0?{
                        brand:{
                            in:brands,
                            mode:"insensitive",
                        },
                    }:{},
                    sizes.length>0?{
                        sizes:{
                            hashSome:sizes,
                        },
                    }:{},
                    colors.length>0?{
                        colors:{
                            hasSome:colors,
                        },
                    }:{},
                    {
                        price:{gte:minPrice,lte:maxPrice},
                    }
                ]
            };
            const [products,total]=await Promise.all([
                prisma.product.findMany({
                    where,
                    skip,
                    take:limit,
                    orderBy:{
                        [sortBy]:sortOrder,
                    },
                }),
                prisma.product.count({where}),
            ])
res.status(200).json({
    products,
    currentPage:page,
    totalPages:Math.ceil(total/limit),
    totalItems:total,
});
    }catch(e){
console.error(e);
res.status(500).json({message:"some issue"});
    }
}