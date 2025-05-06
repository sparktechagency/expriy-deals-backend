
import { Router } from 'express';
import { withdrawRequestController } from './withdrawRequest.controller';

const router = Router();

router.post('/', withdrawRequestController.createWithdrawRequest);
router.patch('/:id', withdrawRequestController.updateWithdrawRequest);
router.delete('/:id', withdrawRequestController.deleteWithdrawRequest);
router.get('/:id', withdrawRequestController.getWithdrawRequestById);
router.get('/', withdrawRequestController.getAllWithdrawRequest);

export const withdrawRequestRoutes = router;