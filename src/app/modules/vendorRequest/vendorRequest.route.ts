import { Router } from 'express';
import { vendorRequestController } from './vendorRequest.controller';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constants';
import multer, { memoryStorage } from 'multer';
import parseData from '../../middleware/parseData';
import validateRequest from '../../middleware/validateRequest';
import { vendorRequestValidator } from './vendorRequest.validation';

const router = Router();
const storage = memoryStorage();
const upload = multer({ storage });

router.post(
  '/',
  upload.single('document'),
  parseData(),
  vendorRequestController.createVendorRequest,
  vendorRequestController.createVendorRequest,
);

router.patch(
  '/approve/:id',
  auth(USER_ROLE.admin, USER_ROLE.sub_admin, USER_ROLE.super_admin),
  vendorRequestController.approveVendorRequest,
);

router.patch(
  '/reject/:id',
  auth(USER_ROLE.admin, USER_ROLE.sub_admin, USER_ROLE.super_admin),
  validateRequest(vendorRequestValidator.rejectRequestSchema),
  vendorRequestController.rejectVendorRequest,
);

router.patch(
  '/:id',
  auth(USER_ROLE.admin, USER_ROLE.sub_admin, USER_ROLE.super_admin),
  vendorRequestController.updateVendorRequest,
);

router.delete(
  '/:id',
  auth(USER_ROLE.admin, USER_ROLE.sub_admin, USER_ROLE.super_admin),
  vendorRequestController.deleteVendorRequest,
);

router.get(
  '/:id',
  auth(USER_ROLE.admin, USER_ROLE.sub_admin, USER_ROLE.super_admin),
  vendorRequestController.getVendorRequestById,
);

router.get(
  '/',
  auth(USER_ROLE.admin, USER_ROLE.sub_admin, USER_ROLE.super_admin),
  vendorRequestController.getAllVendorRequest,
);

export const vendorRequestRoutes = router;
