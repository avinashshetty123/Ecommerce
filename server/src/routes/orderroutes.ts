import express from 'express';
import { authenticateJwt,isSuperAdmin } from '../middleware/authMiddleware';
import{capturePayPalOrder,createFinalOrder,createOrder,getAllOrderForAdmin,getOrder,getOrderByid,updateOrderStatus} from '../controllers/ordercontroller'
const router=express.Router();
router.use(authenticateJwt);
router.post("/create-paypal-order",createOrder);
router.post("/capture-paypal-order",capturePayPalOrder);
router.post("/create-final-order", createFinalOrder);
router.get("/get-order/:id", getOrder);
router.get("/get-orderbyid/:id", getOrderByid);
router.get("/get-all-order",isSuperAdmin, getAllOrderForAdmin);
router.put('/:orderId/status',isSuperAdmin,updateOrderStatus);
export default router;