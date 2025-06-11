import { Router } from 'express';
import { paymentsController } from './payments.controller';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constants';

const router = Router();

router.post(
  '/checkout',
  auth(USER_ROLE.user),
  paymentsController.createPayments,
);
router.get(
  '/dashboard-data',
  auth(USER_ROLE.admin),
  paymentsController.dashboardData,
);
router.get(
  '/vendor-dashboard-data',
  auth(USER_ROLE.vendor),
  paymentsController.vendorDashboardData,
);
router.get(
  '/vendor-earnings',
  auth(USER_ROLE.vendor),
  paymentsController.getVendorEarnings,
);
router.get('/confirm-payment', paymentsController.confirmPayment);
router.get('/earnings', auth(USER_ROLE.admin), paymentsController.getEarnings);
router.patch('/:id', paymentsController.updatePayments);
router.delete('/:id', paymentsController.deletePayments);
router.get('/:id', paymentsController.getPaymentsById);
router.get('/order/:orderId', paymentsController.getPaymentsByOrderId);
router.get('/', paymentsController.getAllPayments);

export const paymentsRoutes = router;
