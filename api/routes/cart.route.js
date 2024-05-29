import express from 'express';
import { cartCalculation } from '../controllers/cart.controller.js';

const router = express.Router();

router.post('/cartCalculation', cartCalculation)

export default router;