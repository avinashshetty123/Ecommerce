import express from 'express';
import {
    login,
    logout,
    refreshAccesstoken,
    register
} from '../controllers/authcontroller'
const router=express.Router();
router.post('/register',register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/refresh-token', refreshAccesstoken);
export default router;