import express from 'express';
import { authenticateJwt,isSuperAdmin } from '../middleware/authMiddleware';
const router=express.Router();
router.use(authenticateJwt);
import{
    createCoupon,
    deletecoupon,
    fetchallcoupons
} from '../controllers/couponcontroller'
router.get("/getallcoupons",fetchallcoupons);
router.post("/createcoupon",isSuperAdmin, createCoupon);;
router.delete("/deletecoupon/:id", isSuperAdmin, deletecoupon);
export default router;