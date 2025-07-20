import express from 'express'
import { authenticateJwt,isSuperAdmin } from '../middleware/authMiddleware'
import { upload } from '../middleware/uploadmiddleware'
import{addFeatureBanner,fetchFeatureBanner,getFeaturedProducts,updateFeatureBanner} from '../controllers/settingscontroller'
const router=express.Router();
router.post('/banners',authenticateJwt,isSuperAdmin,upload.array('image',5),
addFeatureBanner
);
router.get('/get-banners',fetchFeatureBanner);
router.post('/update-banner',authenticateJwt,isSuperAdmin,updateFeatureBanner);
router.get('/featured-products',authenticateJwt, getFeaturedProducts);
export default router;