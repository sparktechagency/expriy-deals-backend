import { Router } from 'express';
import { withdrawRequestController } from './withdrawRequest.controller';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constants';
import validateRequest from '../../middleware/validateRequest';
import { withdrawRequestValidation } from './withdrawRequest.validation';

const router = Router();

router.post(
  '/',
  auth(USER_ROLE.vendor),
  withdrawRequestController.createWithdrawRequest,
);

router.patch(
  '/approved/:id',
  auth(USER_ROLE.admin),
  withdrawRequestController.approvedWithdrawRequest,
);

router.patch(
  '/reject/:id',
  auth(USER_ROLE.admin),
  validateRequest(withdrawRequestValidation?.rejectRequestValidator),
  withdrawRequestController.rejectWithdrawRequest,
);

router.patch(
  '/:id',
  auth(USER_ROLE.admin),
  withdrawRequestController.updateWithdrawRequest,
);

router.delete(
  '/:id',
  auth(USER_ROLE.admin),
  withdrawRequestController.deleteWithdrawRequest,
);
router.get(
  '/:id',
  auth(USER_ROLE.admin, USER_ROLE.vendor),
  withdrawRequestController.getWithdrawRequestById,
);
router.get(
  '/',
  auth(USER_ROLE.admin, USER_ROLE.vendor),
  withdrawRequestController.getAllWithdrawRequest,
);

export const withdrawRequestRoutes = router;
