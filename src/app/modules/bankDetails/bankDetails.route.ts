import { Router } from 'express';
import { bankDetailsController } from './bankDetails.controller';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constants';

const router = Router();

router.post(
  '/',
  auth(USER_ROLE.vendor),
  bankDetailsController.createBankDetails,
);
router.patch(
  '/:id',
  auth(USER_ROLE.vendor),
  bankDetailsController.updateBankDetails,
);
router.delete(
  '/:id',
  auth(USER_ROLE.vendor),
  bankDetailsController.deleteBankDetails,
);
router.get(
  '/my-bank-details',
  auth(USER_ROLE.vendor),
  bankDetailsController.getBankDetailsByVendorId,
);
router.get(
  '/:id',
  auth(USER_ROLE.vendor, USER_ROLE.admin),
  bankDetailsController.getBankDetailsById,
);
router.get(
  '/',
  auth(USER_ROLE.vendor, USER_ROLE.admin),
  bankDetailsController.getAllBankDetails,
);

export const bankDetailsRoutes = router;
