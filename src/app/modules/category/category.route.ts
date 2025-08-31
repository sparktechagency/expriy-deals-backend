import { Router } from 'express';
import { categoryController } from './category.controller';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constants';
import parseData from '../../middleware/parseData';
import multer, { memoryStorage } from 'multer';
// import fileUpload from '../../middleware/fileUpload';
// const upload = fileUpload('./public/uploads/categories');

const router = Router();
const storage = memoryStorage();
const upload = multer({ storage });

router.post(
  '/',
  auth(
    USER_ROLE.admin,
    USER_ROLE.sub_admin,
    USER_ROLE.super_admin,
    USER_ROLE.vendor,
  ),
  upload.single('banner'),
  parseData(),
  categoryController.createCategory,
);

router.patch(
  '/:id',
  auth(
    USER_ROLE.admin,
    USER_ROLE.sub_admin,
    USER_ROLE.super_admin,
    USER_ROLE.vendor,
  ),
  upload.single('banner'),
  parseData(),
  categoryController.updateCategory,
);

router.delete(
  '/:id',
  auth(
    USER_ROLE.admin,
    USER_ROLE.sub_admin,
    USER_ROLE.super_admin,
    USER_ROLE.vendor,
  ),
  categoryController.deleteCategory,
);

router.get('/:id', categoryController.getCategoryById);
router.get('/', categoryController.getAllCategory);

export const categoryRoutes = router;
