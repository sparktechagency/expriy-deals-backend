"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addToCardRoutes = void 0;
const express_1 = require("express");
const addToCard_controller_1 = require("./addToCard.controller");
const auth_1 = __importDefault(require("../../middleware/auth"));
const user_constants_1 = require("../user/user.constants");
const router = (0, express_1.Router)();
router.post('/', (0, auth_1.default)(user_constants_1.USER_ROLE.user), addToCard_controller_1.addToCardController.createAddToCard);
router.patch('/:id', (0, auth_1.default)(user_constants_1.USER_ROLE.user), addToCard_controller_1.addToCardController.updateAddToCard);
router.delete('/empty', (0, auth_1.default)(user_constants_1.USER_ROLE.user), addToCard_controller_1.addToCardController.emptyMyCard);
router.delete('/:id', (0, auth_1.default)(user_constants_1.USER_ROLE.user), addToCard_controller_1.addToCardController.deleteAddToCard);
router.get('/:id', (0, auth_1.default)(user_constants_1.USER_ROLE.user), addToCard_controller_1.addToCardController.getAddToCardById);
router.get('/', (0, auth_1.default)(user_constants_1.USER_ROLE.user), addToCard_controller_1.addToCardController.getAllAddToCard);
exports.addToCardRoutes = router;
