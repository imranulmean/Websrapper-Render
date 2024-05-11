import express from 'express';
import { verifyToken } from '../utils/verifyUser.js';
import { getSearchProducts, findSimilarProducts } from '../controllers/search.controller.js';

const router = express.Router();

router.get('/getSearchProducts', getSearchProducts)
router.get('/findSimilarProducts', findSimilarProducts)


export default router;