import { Router } from 'express';
import { shopController } from './shop.controller';
import multer, { memoryStorage } from 'multer';
import parseData from '../../middleware/parseData';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constants';

const router = Router();
const storage = memoryStorage();
const upload = multer({ storage });

// router.post('/', shopController.createShop);
router.patch(
  '/update-my-shop',
  auth(USER_ROLE.vendor),
  upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'banner', maxCount: 1 },
  ]),
  parseData(),
  shopController.updateShop,
);

router.patch(
  '/:id',
  auth(USER_ROLE.admin, USER_ROLE.sub_admin, USER_ROLE.super_admin),
  upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'banner', maxCount: 1 },
  ]),
  parseData(),
  shopController.updateShop,
);

router.delete(
  '/:id',
  auth(
    USER_ROLE.vendor,
    USER_ROLE.admin,
    USER_ROLE.sub_admin,
    USER_ROLE.super_admin,
  ),
  shopController.deleteShop,
);
router.get('/my-shop', auth(USER_ROLE.vendor), shopController.getShopById);
router.get('/:id', shopController.getShopById);
router.get('/', shopController.getAllShop);

export const shopRoutes = router;
