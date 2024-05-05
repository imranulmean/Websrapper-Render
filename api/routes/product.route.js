import express from 'express';
import { verifyToken } from '../utils/verifyUser.js';
import { getColesProducts, getWoolsProducts, getComparisonProducts } from '../controllers/product.controller.js';

const router = express.Router();

router.get('/getColesProducts', getColesProducts)
router.get('/getWoolsProducts', getWoolsProducts)
router.get('/getComparisonProducts', getComparisonProducts)

export default router;