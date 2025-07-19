import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";
const prisma =new PrismaClient();
    
async function main() {
    const email="admin@gmail.com";
    const password="123455";
    const name="SuperAdmin";
    const exisitingSuperAdmin=await prisma.user.findFirst({
        where:{role:"SUPER_ADMIN"},
    });
    if(exisitingSuperAdmin){
        return;
    }
    const hashedPassword=await argon2.hash(password);
    const superadminuser=await prisma.user.create({
        data:{
            email,
            name,
            password:hashedPassword,
            role:"SUPER_ADMIN",

        },
    });
    console.log("SuperAdmin Created Succesfuly",superadminuser.email);


}
main().catch((e)=>{
    console.error(e);
    process.exit(1);

})
.finally(async()=>{
    await prisma.$disconnect();
})