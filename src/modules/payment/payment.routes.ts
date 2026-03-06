import { Router } from 'express';
import { PaymentController } from './payment.controller';
import { auth, authorize } from '../auth/auth.middleware';
import { asyncHandler } from '../../Share/utils/asyncHandler';

const router = Router();
const controller = new PaymentController();

// Create payment intent
router.post('/initiate', auth, asyncHandler(controller.initiatePayment.bind(controller)));

// Verify eSewa callback
router.get('/verify', auth, asyncHandler(controller.verifyPayment.bind(controller)));

// Admin transaction dashboard
router.get('/admin/transactions', auth, authorize('admin'), asyncHandler(controller.getTransactions.bind(controller)));

export default router;
