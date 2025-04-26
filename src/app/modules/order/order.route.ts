
import { Router } from 'express';
import { orderController } from './order.controller';

const router = Router();

router.post('/', orderController.createOrder);
router.patch('/:id', orderController.updateOrder);
router.delete('/:id', orderController.deleteOrder);
router.get('/:id', orderController.getOrderById);
router.get('/', orderController.getAllOrder);

export const orderRoutes = router;