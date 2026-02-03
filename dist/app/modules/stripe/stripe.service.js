"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripeService = exports.stripeRefund = exports.createTransfer = exports.createPaymentIntent = void 0;
exports.addFundsToTestAccount = addFundsToTestAccount;
const stripe_1 = __importDefault(require("stripe"));
const config_1 = __importDefault(require("../../config"));
const user_models_1 = require("../user/user.models");
const AppError_1 = __importDefault(require("../../error/AppError"));
const http_status_1 = __importDefault(require("http-status"));
const stripe_2 = __importDefault(require("../../class/stripe/stripe"));
const stripe = new stripe_1.default((_a = config_1.default.stripe) === null || _a === void 0 ? void 0 : _a.stripe_api_secret, {
    apiVersion: '2024-06-20',
    typescript: true,
});
// Create Stripe account and return the account link URL
const stripLinkAccount = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    console.log((_a = config_1.default.stripe) === null || _a === void 0 ? void 0 : _a.stripe_api_secret);
    const user = yield user_models_1.User.findById(userId);
    if (!user) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'User not found!');
    }
    try {
        const account = yield stripe.accounts.create({});
        // const accountLink = await stripe.accountLinks.create({
        //   account: account.id,
        //   type: 'account_onboarding',
        // });
        const return_url = `${config_1.default === null || config_1.default === void 0 ? void 0 : config_1.default.server_url}/stripe/return/${account.id}?userId=${user === null || user === void 0 ? void 0 : user._id}`;
        const refresh_url = `${config_1.default === null || config_1.default === void 0 ? void 0 : config_1.default.server_url}/stripe/refresh/${account.id}?userId=${user === null || user === void 0 ? void 0 : user._id}`;
        const accountLink = yield (stripe_2.default === null || stripe_2.default === void 0 ? void 0 : stripe_2.default.connectAccount(return_url, refresh_url, account.id));
        return accountLink.url;
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.BAD_GATEWAY, error.message);
    }
});
// Handle Stripe OAuth and save the connected account ID
const handleStripeOAuth = (query, userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield stripe.oauth.token({
            grant_type: 'authorization_code',
            code: query.code,
        });
        const connectedAccountId = response.stripe_user_id;
        yield user_models_1.User.findByIdAndUpdate(userId, {
            stripeAccountId: connectedAccountId,
        });
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, error.message);
    }
});
// Refresh the account link for a given payment ID
const refresh = (paymentId, query) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_models_1.User.findById(query.userId);
    if (!user) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'User not found!');
    }
    try {
        const return_url = `${config_1.default === null || config_1.default === void 0 ? void 0 : config_1.default.client_Url}/seller/confirmation?userId=${user._id}&stripeAccountId=${paymentId}`;
        const refresh_url = `${config_1.default === null || config_1.default === void 0 ? void 0 : config_1.default.server_url}/stripe/refresh/${paymentId}?userId=${user === null || user === void 0 ? void 0 : user._id}`;
        const accountLink = yield (stripe_2.default === null || stripe_2.default === void 0 ? void 0 : stripe_2.default.connectAccount(return_url, refresh_url, paymentId));
        return accountLink.url;
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, error.message);
    }
});
// Handle the return URL and update the user's Stripe account ID
const returnUrl = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // const response = await stripe.oauth.token({
        //   grant_type: "authorization_code",
        //   code: query.code as string,
        // });
        // const connectedAccountId = response.stripe_user_id;
        const user = yield user_models_1.User.findByIdAndUpdate(payload.userId, {
            stripeAccountId: payload === null || payload === void 0 ? void 0 : payload.stripeAccountId,
        });
        if (!user) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'user not found!');
        }
        return { url: config_1.default === null || config_1.default === void 0 ? void 0 : config_1.default.client_Url };
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, error.message);
    }
});
// Create a payment intent
const createPaymentIntent = (amount, currency) => __awaiter(void 0, void 0, void 0, function* () {
    return yield stripe.paymentIntents.create({
        amount,
        currency,
    });
});
exports.createPaymentIntent = createPaymentIntent;
// Create a transfer to a seller's Stripe account
const createTransfer = (amount, sellerStripeAccountId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const balance = yield stripe.balance.retrieve();
        const availableBalance = balance.available.reduce((total, bal) => total + bal.amount, 0);
        if (availableBalance < amount) {
            console.log('Insufficient funds to cover the transfer.');
            throw new AppError_1.default(http_status_1.default === null || http_status_1.default === void 0 ? void 0 : http_status_1.default.BAD_REQUEST, 'Insufficient funds to cover the transfer.');
        }
        return yield stripe.transfers.create({
            amount,
            currency: 'usd',
            destination: sellerStripeAccountId,
        });
    }
    catch (error) {
        console.error(error);
    }
});
exports.createTransfer = createTransfer;
const stripeRefund = (payment_intent, amount) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const refund = yield stripe.refunds.create({
            payment_intent: payment_intent,
            amount: Math.round(amount),
        });
        return refund;
    }
    catch (error) {
        console.error(error);
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, error === null || error === void 0 ? void 0 : error.message);
    }
});
exports.stripeRefund = stripeRefund;
function addFundsToTestAccount() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const paymentIntent = yield stripe.paymentIntents.create({
                amount: 100000, // $1000.00 in cents
                currency: 'usd',
                payment_method_types: ['card'],
                payment_method_data: {
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    //@ts-ignore
                    type: 'card',
                    card: {
                        number: '4000000000000077',
                        exp_month: 12,
                        exp_year: 2024,
                        cvc: '123',
                    },
                },
                confirm: true,
            });
            console.log('Payment successful:', paymentIntent);
        }
        catch (error) {
            console.error('Error adding funds:', error);
        }
    });
}
exports.stripeService = {
    handleStripeOAuth,
    stripLinkAccount,
    refresh,
    returnUrl,
};
