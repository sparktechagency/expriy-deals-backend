"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const otp_routes_1 = require("../modules/otp/otp.routes");
const user_route_1 = require("../modules/user/user.route");
const auth_route_1 = require("../modules/auth/auth.route");
const notificaiton_route_1 = require("../modules/notification/notificaiton.route");
const contents_route_1 = require("../modules/contents/contents.route");
const payments_route_1 = require("../modules/payments/payments.route");
const category_route_1 = require("../modules/category/category.route");
const products_route_1 = require("../modules/products/products.route");
const order_route_1 = require("../modules/order/order.route");
const bankDetails_route_1 = require("../modules/bankDetails/bankDetails.route");
const withdrawRequest_route_1 = require("../modules/withdrawRequest/withdrawRequest.route");
const shop_route_1 = require("../modules/shop/shop.route");
const addToCard_route_1 = require("../modules/addToCard/addToCard.route");
const vendorRequest_route_1 = require("../modules/vendorRequest/vendorRequest.route");
const stripe_route_1 = __importDefault(require("../modules/stripe/stripe.route"));
const router = (0, express_1.Router)();
const moduleRoutes = [
    {
        path: '/users',
        route: user_route_1.userRoutes,
    },
    {
        path: '/auth',
        route: auth_route_1.authRoutes,
    },
    {
        path: '/vendor-request',
        route: vendorRequest_route_1.vendorRequestRoutes,
    },
    {
        path: '/otp',
        route: otp_routes_1.otpRoutes,
    },
    {
        path: '/notifications',
        route: notificaiton_route_1.notificationRoutes,
    },
    {
        path: '/categories',
        route: category_route_1.categoryRoutes,
    },
    {
        path: '/products',
        route: products_route_1.productsRoutes,
    },
    {
        path: '/orders',
        route: order_route_1.orderRoutes,
    },
    {
        path: '/payments',
        route: payments_route_1.paymentsRoutes,
    },
    {
        path: '/contents',
        route: contents_route_1.contentsRoutes,
    },
    {
        path: '/bank-details',
        route: bankDetails_route_1.bankDetailsRoutes,
    },
    {
        path: '/withdraw-request',
        route: withdrawRequest_route_1.withdrawRequestRoutes,
    },
    {
        path: '/shop',
        route: shop_route_1.shopRoutes,
    },
    {
        path: '/stripe',
        route: stripe_route_1.default,
    },
    {
        path: '/add-to-card',
        route: addToCard_route_1.addToCardRoutes,
    },
];
moduleRoutes.forEach(route => router.use(route.path, route.route));
exports.default = router;
