import express from 'express';
import { verifyToken } from '../utils/verifyUser.js';
import { getColesProducts, getWoolsProducts, getIgaProducts, getComparisonProducts_with_Type_Weights
        } from '../controllers/product.controller.js';
import { getSimilarProducts_DiffShop } from '../controllers/product.controller_test.js';        

const router = express.Router();
router.get('/getColesProducts', getColesProducts)
router.get('/getWoolsProducts', getWoolsProducts)
router.get('/getIgaProducts', getIgaProducts)
router.get('/getComparisonProducts_with_Type_Weights', getComparisonProducts_with_Type_Weights)
router.post('/getSimilarProducts_DiffShop', getSimilarProducts_DiffShop)
// router.post('/getComparisonProducts_with_Only_Weights', getComparisonProducts_with_Only_Weights)


export default router;