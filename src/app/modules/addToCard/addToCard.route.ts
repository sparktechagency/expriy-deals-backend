import { Router } from 'express';
import { addToCardController } from './addToCard.controller';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constants';

const router = Router();

router.post('/', auth(USER_ROLE.user), addToCardController.createAddToCard);
router.patch('/:id', auth(USER_ROLE.user), addToCardController.updateAddToCard);
router.delete(
  '/:id',
  auth(USER_ROLE.user),
  addToCardController.deleteAddToCard,
);
router.delete('/empty', auth(USER_ROLE.user), addToCardController.emptyMyCard);

router.get('/:id', auth(USER_ROLE.user), addToCardController.getAddToCardById);
router.get('/', auth(USER_ROLE.user), addToCardController.getAllAddToCard);

export const addToCardRoutes = router;
