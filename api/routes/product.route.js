import express from 'express';
import { verifyToken } from '../utils/verifyUser.js';
import { getColesProducts, getWoolsProducts, getComparisonProducts, getComparisonProducts_with_Type_Weights} from '../controllers/product.controller.js';

const router = express.Router();

router.get('/getColesProducts', getColesProducts)
router.get('/getWoolsProducts', getWoolsProducts)
router.get('/getComparisonProducts', getComparisonProducts)
router.get('/getComparisonProducts_with_Weights', getComparisonProducts_with_Type_Weights)


export default router;