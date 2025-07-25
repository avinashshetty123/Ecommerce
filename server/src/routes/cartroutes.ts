import express from 'express';
import { authenticateJwt } from '../middleware/authMiddleware';
import { addTocart,clearCart,removefromcart,getCart ,updateCartItems} from '../controllers/cartcontroller';
const router = express.Router();
router.use(authenticateJwt);
router.post('/add-to-cart', addTocart);
router.get('/fetch-cart', getCart);
router.delete('/remove/:id', removefromcart);
router.delete('/clear-cart', clearCart);
router.put('/update/:id', updateCartItems);
export default router;