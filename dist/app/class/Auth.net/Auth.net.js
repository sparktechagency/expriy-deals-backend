"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
Object.defineProperty(exports, "__esModule", { value: true });
const authorizenet = __importStar(require("authorizenet"));
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config();
// Authorize.Net configuration
const API_LOGIN_ID = process.env.AUTHORIZE_NET_API_LOGIN_ID || '';
const TRANSACTION_KEY = process.env.AUTHORIZE_NET_TRANSACTION_KEY || '';
const ENVIRONMENT = process.env.AUTHORIZE_NET_ENVIRONMENT || 'SANDBOX';
// PaymentService class
class AuthPaymentService {
    constructor() {
        // Initialize merchant authentication
        this.merchantAuthentication =
            new authorizenet.APIContracts.MerchantAuthenticationType();
        this.merchantAuthentication.setName(API_LOGIN_ID);
        this.merchantAuthentication.setTransactionKey(TRANSACTION_KEY);
        // Set environment (SANDBOX or PRODUCTION)
        this.environment =
            ENVIRONMENT === 'SANDBOX'
                ? authorizenet.Constants.endpoint.sandbox
                : authorizenet.Constants.endpoint.production;
    }
    createCharge(request) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            try {
                const { amount, cardNumber, expiryDate, cardCode, firstName, lastName } = request;
                // Validate input
                if (!amount ||
                    !cardNumber ||
                    !expiryDate ||
                    !cardCode ||
                    !firstName ||
                    !lastName) {
                    throw new Error('Missing required fields');
                }
                // Create credit card object
                const creditCard = new authorizenet.APIContracts.CreditCardType();
                creditCard.setCardNumber(cardNumber);
                creditCard.setExpirationDate(expiryDate);
                creditCard.setCardCode(cardCode);
                // Create payment object
                const paymentType = new authorizenet.APIContracts.PaymentType();
                paymentType.setCreditCard(creditCard);
                // Create billing information
                const billTo = new authorizenet.APIContracts.CustomerAddressType();
                billTo.setFirstName(firstName);
                billTo.setLastName(lastName);
                // Create transaction request
                const transactionRequest = new authorizenet.APIContracts.TransactionRequestType();
                transactionRequest.setTransactionType(authorizenet.APIContracts.TransactionTypeEnum.AUTHCAPTURETRANSACTION);
                transactionRequest.setAmount(amount.toFixed(2));
                transactionRequest.setPayment(paymentType);
                transactionRequest.setCurrencyCode('USD');
                transactionRequest.setBillTo(billTo);
                // Create the controller request
                const createRequest = new authorizenet.APIContracts.CreateTransactionRequest();
                createRequest.setMerchantAuthentication(this.merchantAuthentication);
                createRequest.setTransactionRequest(transactionRequest);
                const ctrl = new authorizenet.APIControllers.CreateTransactionController(createRequest.getJSON());
                ctrl.setEnvironment(this.environment);
                const response = yield new Promise((resolve, reject) => {
                    ctrl.execute(() => {
                        const rawResponse = ctrl.getResponse();
                        if (rawResponse) {
                            const apiResponse = new authorizenet.APIContracts.CreateTransactionResponse(rawResponse);
                            resolve(apiResponse);
                        }
                        else {
                            reject(new Error('No response from Authorize.Net'));
                        }
                    });
                });
                if (!response || !response.getTransactionResponse()) {
                    throw new Error('Invalid response from Authorize.Net');
                }
                const transactionResponse = response.getTransactionResponse();
                console.log('🚀 ~ AuthPaymentService ~ transactionResponse:', transactionResponse);
                console.log('🚀 ~ AuthPaymentService ~ messages:', transactionResponse === null || transactionResponse === void 0 ? void 0 : transactionResponse.messages);
                const resultCode = (_a = response.getMessages()) === null || _a === void 0 ? void 0 : _a.getResultCode();
                if (resultCode !== 'Ok') {
                    const errorMessages = (_b = response.getMessages()) === null || _b === void 0 ? void 0 : _b.getMessage();
                    const errors = (errorMessages === null || errorMessages === void 0 ? void 0 : errorMessages.map((m) => m.getText()).join(', ')) ||
                        'Unknown error';
                    throw new Error(`Payment failed: ${errors}`);
                }
                if (transactionResponse.getResponseCode() === '1') {
                    return {
                        transactionId: transactionResponse.getTransId(),
                        authCode: transactionResponse.getAuthCode(),
                    };
                }
                else {
                    const errors = ((_d = (_c = transactionResponse
                        .getErrors()) === null || _c === void 0 ? void 0 : _c.getError()) === null || _d === void 0 ? void 0 : _d.map((e) => e.getErrorText())) || ['Unknown error'];
                    throw new Error(`Transaction failed: ${errors.join(', ')}`);
                }
            }
            catch (error) {
                console.log('-------------:::::::::>', error);
                // console.error('Create charge error:', error);
                throw new Error(`Payment processing failed: ${error.message}`);
            }
        });
    }
    // Issue a refund
    refund(request) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            try {
                const { transactionId, amount, cardNumber } = request;
                // Validate input
                if (!transactionId || !cardNumber) {
                    throw new Error('Missing required fields');
                }
                // Create credit card object for refund (last 4 digits)
                const creditCard = new authorizenet.APIContracts.CreditCardType();
                creditCard.setCardNumber(cardNumber.slice(-4));
                creditCard.setExpirationDate('XXXX'); // Ignored for refunds
                // Create payment object
                const paymentType = new authorizenet.APIContracts.PaymentType();
                paymentType.setCreditCard(creditCard);
                // Create transaction request
                const transactionRequest = new authorizenet.APIContracts.TransactionRequestType();
                transactionRequest.setTransactionType(authorizenet.APIContracts.TransactionTypeEnum.REFUNDTRANSACTION);
                if (amount)
                    transactionRequest.setAmount(amount.toFixed(2));
                transactionRequest.setPayment(paymentType);
                transactionRequest.setRefTransId(transactionId);
                // Create the controller request
                const createRequest = new authorizenet.APIContracts.CreateTransactionRequest();
                createRequest.setMerchantAuthentication(this.merchantAuthentication);
                createRequest.setTransactionRequest(transactionRequest);
                // Execute refund
                const ctrl = new authorizenet.APIControllers.CreateTransactionController(createRequest);
                ctrl.setEnvironment(this.environment); // Set environment explicitly
                const response = yield new Promise((resolve, reject) => {
                    ctrl.execute(() => {
                        const apiResponse = ctrl.getResponse();
                        if (apiResponse)
                            resolve(apiResponse);
                        else
                            reject(new Error('No response from Authorize.Net'));
                    });
                });
                // Check response
                const transactionResponse = response.getTransactionResponse();
                if (response.getMessages().getResultCode() ===
                    authorizenet.APIContracts.MessageTypeEnum.OK &&
                    transactionResponse) {
                    if ((transactionResponse === null || transactionResponse === void 0 ? void 0 : transactionResponse.getResponseCode()) === '1') {
                        return {
                            transactionId: transactionResponse.getTransId(),
                            status: 'Refunded',
                        };
                    }
                    else {
                        const errors = ((_b = (_a = transactionResponse
                            .getErrors()) === null || _a === void 0 ? void 0 : _a.getError()) === null || _b === void 0 ? void 0 : _b.map((e) => e.getErrorText())) || [
                            'Unknown error',
                        ];
                        throw new Error(`Refund failed: ${errors.join(', ')}`);
                    }
                }
                else {
                    const errors = ((_d = (_c = response
                        .getMessages()) === null || _c === void 0 ? void 0 : _c.getMessage()) === null || _d === void 0 ? void 0 : _d.map((m) => m.getText())) || [
                        'Unknown error',
                    ];
                    throw new Error(`API error: ${errors.join(', ')}`);
                }
            }
            catch (error) {
                console.error('Refund error:', error);
                throw new Error(`Refund processing failed: ${error.message}`);
            }
        });
    }
    // Check transaction status
    checkStatus(transactionId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            try {
                // Create request
                const getRequest = new authorizenet.APIContracts.GetTransactionDetailsRequest();
                getRequest.setMerchantAuthentication(this.merchantAuthentication);
                getRequest.setTransId(transactionId);
                // Execute request
                const ctrl = new authorizenet.APIControllers.GetTransactionDetailsController(getRequest);
                ctrl.setEnvironment(this.environment); // Set environment explicitly
                const response = yield new Promise((resolve, reject) => {
                    ctrl.execute(() => {
                        const apiResponse = ctrl.getResponse();
                        if (apiResponse)
                            resolve(apiResponse);
                        else
                            reject(new Error('No response from Authorize.Net'));
                    });
                });
                // Check response
                if (response.getMessages().getResultCode() ===
                    authorizenet.APIContracts.MessageTypeEnum.OK) {
                    const transaction = response.getTransaction();
                    return {
                        transactionId: transaction.getTransId(),
                        status: transaction.getTransactionStatus(),
                        responseCode: transaction.getResponseCode(),
                        authCode: transaction.getAuthCode(),
                        errors: (_b = (_a = transaction
                            .getErrors()) === null || _a === void 0 ? void 0 : _a.getError()) === null || _b === void 0 ? void 0 : _b.map((e) => e.getErrorText()),
                    };
                }
                else {
                    const errors = ((_d = (_c = response
                        .getMessages()) === null || _c === void 0 ? void 0 : _c.getMessage()) === null || _d === void 0 ? void 0 : _d.map((m) => m.getText())) || [
                        'Unknown error',
                    ];
                    throw new Error(`Status check failed: ${errors.join(', ')}`);
                }
            }
            catch (error) {
                console.error('Check status error:', error);
                throw new Error(`Status check failed: ${error.message}`);
            }
        });
    }
}
exports.default = AuthPaymentService;
