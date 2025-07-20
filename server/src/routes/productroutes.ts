import express from 'express'
import { authenticateJwt,isSuperAdmin } from '../middleware/authMiddleware'
import {upload} from '../middleware/uploadmiddleware'
const router=express.Router();
router.use(authenticateJwt);
import{
    createProduct,
    deleteProduct,
    fetchallProductsForAdmin,
    getProductById,
    getProductsForClients,
    updateProduct
} from '../controllers/productcontroller'

router.post("/create-new-product",isSuperAdmin,upload.array("images",5),createProduct);
router.get("/fetch-admin-products",isSuperAdmin,fetchallProductsForAdmin);
router.get("/:id", getProductById);
router.get("/", getProductsForClients);
router.delete("/:id", isSuperAdmin, deleteProduct);
router.put("/:id", isSuperAdmin, upload.array("images", 5), updateProduct);
export default router;
