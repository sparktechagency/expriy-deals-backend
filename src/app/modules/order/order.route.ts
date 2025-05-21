import { Router } from 'express';
import { orderController } from './order.controller';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constants';

const router = Router();

router.post('/', auth(USER_ROLE.user), orderController.createOrder);
router.patch('/:id', auth(USER_ROLE.vendor), orderController.updateOrder);
router.delete(
  '/:id',
  auth(USER_ROLE.vendor, USER_ROLE.admin),
  orderController.deleteOrder,
);
router.get('/my-orders', auth(USER_ROLE.user), orderController.getMyOrders);
router.get('/my-shop-orders', auth(USER_ROLE.user), orderController.getMyShopOrders);
// router.get('/order-request', orderController.getOrderById);
router.get('/:id', orderController.getOrderById);
router.get(
  '/',
  auth(USER_ROLE.vendor, USER_ROLE.user),
  orderController.getAllOrder,
);

export const orderRoutes = router;
