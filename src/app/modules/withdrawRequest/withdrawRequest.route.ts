import { Router } from 'express';
import { withdrawRequestController } from './withdrawRequest.controller';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constants';

const router = Router();

router.post(
  '/',
  auth(USER_ROLE.vendor),
  withdrawRequestController.createWithdrawRequest,
);
router.patch(
  '/:id',
  auth(USER_ROLE.admin),
  withdrawRequestController.updateWithdrawRequest,
);
router.delete('/:id', withdrawRequestController.deleteWithdrawRequest);
router.get('/:id', withdrawRequestController.getWithdrawRequestById);
router.get('/', withdrawRequestController.getAllWithdrawRequest);

export const withdrawRequestRoutes = router;
