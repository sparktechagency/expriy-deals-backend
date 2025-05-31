
import { Router } from 'express';
import { vendorRequestController } from './vendorRequest.controller';

const router = Router();

router.post('/', vendorRequestController.createVendorRequest);
router.patch('/:id', vendorRequestController.updateVendorRequest);
router.delete('/:id', vendorRequestController.deleteVendorRequest);
router.get('/:id', vendorRequestController.getVendorRequestById);
router.get('/', vendorRequestController.getAllVendorRequest);

export const vendorRequestRoutes = router;