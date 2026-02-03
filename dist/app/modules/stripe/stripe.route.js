"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = __importDefault(require("../../middleware/auth"));
const user_constants_1 = require("../user/user.constants");
const stripe_controller_1 = require("./stripe.controller");
const router = (0, express_1.Router)();
router.patch('/connect', (0, auth_1.default)(user_constants_1.USER_ROLE.vendor), stripe_controller_1.stripeController.stripLinkAccount);
router.get('/oauth/callback', stripe_controller_1.stripeController.handleStripeOAuth);
router.get('/return/:id', stripe_controller_1.stripeController.returnUrl);
router.get('/refresh/:id', stripe_controller_1.stripeController.refresh);
const stripeRoute = router;
exports.default = stripeRoute;
