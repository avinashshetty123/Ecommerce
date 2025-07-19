import axios from 'axios'
import { AuthenticatedRequest } from '../middleware/authMiddleware'
import { prisma } from '../server'
import {v4 as uuidv4} from 'uuid';
import dotenv from 'dotenv';
import { base64url } from 'jose';
dotenv.config();
const PAYPAL_CLIENT_ID=process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET=process.env.PAYPAL_CLIENT_SECRET;
async function getPayPalAccessToken() {
    const response =await axios.post("https://api-m.sandbox.paypla.com/v1/oauth2/token","grant_type=client_crendentials",{
        headers:{
            "Content-Type":"application/x-www-form-urlencoded",
            Authorization:`Basic${Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString("base64")}`
        }
    })
    return response.data.access_token;
    
}
