import express from 'express';
import { verifyToken } from '../utils/verifyUser.js';
import { getSearchProducts} from '../controllers/search.controller.js';

const router = express.Router();

router.get('/getSearchProducts', getSearchProducts)

export default router;