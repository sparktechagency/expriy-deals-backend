"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bankDetailsRoutes = void 0;
const express_1 = require("express");
const bankDetails_controller_1 = require("./bankDetails.controller");
const auth_1 = __importDefault(require("../../middleware/auth"));
const user_constants_1 = require("../user/user.constants");
const router = (0, express_1.Router)();
router.post('/', (0, auth_1.default)(user_constants_1.USER_ROLE.vendor), bankDetails_controller_1.bankDetailsController.createBankDetails);
router.patch('/:id', (0, auth_1.default)(user_constants_1.USER_ROLE.vendor), bankDetails_controller_1.bankDetailsController.updateBankDetails);
router.delete('/:id', (0, auth_1.default)(user_constants_1.USER_ROLE.vendor), bankDetails_controller_1.bankDetailsController.deleteBankDetails);
router.get('/my-bank-details', (0, auth_1.default)(user_constants_1.USER_ROLE.vendor), bankDetails_controller_1.bankDetailsController.getBankDetailsByVendorId);
router.get('/:id', (0, auth_1.default)(user_constants_1.USER_ROLE.vendor, user_constants_1.USER_ROLE.admin), bankDetails_controller_1.bankDetailsController.getBankDetailsById);
router.get('/', (0, auth_1.default)(user_constants_1.USER_ROLE.vendor, user_constants_1.USER_ROLE.admin), bankDetails_controller_1.bankDetailsController.getAllBankDetails);
exports.bankDetailsRoutes = router;
