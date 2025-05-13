import * as authorizenet from 'authorizenet';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Authorize.Net configuration
const API_LOGIN_ID = process.env.AUTHORIZE_NET_API_LOGIN_ID || '';
const TRANSACTION_KEY = process.env.AUTHORIZE_NET_TRANSACTION_KEY || '';
const ENVIRONMENT = process.env.AUTHORIZE_NET_ENVIRONMENT || 'SANDBOX';

// Interfaces for request payloads
interface ChargeRequest {
  amount: number;
  cardNumber: string;
  expiryDate: string; // Format: MMYY (e.g., 1225 for Dec 2025)
  cardCode: string; // CVV
  firstName: string;
  lastName: string;
}

interface RefundRequest {
  transactionId: string;
  amount?: number; // Optional: full refund if omitted
  cardNumber: string; // Last 4 digits for verification
}

interface TransactionStatus {
  transactionId: string;
  status: string;
  responseCode: string;
  authCode?: string;
  errors?: string[];
}

// PaymentService class
class AuthPaymentService {
  private merchantAuthentication: authorizenet.APIContracts.MerchantAuthenticationType;
  private environment: string;

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

  async createCharge(
    request: ChargeRequest,
  ): Promise<{ transactionId: string; authCode: string }> {
    try {
      const { amount, cardNumber, expiryDate, cardCode, firstName, lastName } =
        request;

      // Validate input
      if (
        !amount ||
        !cardNumber ||
        !expiryDate ||
        !cardCode ||
        !firstName ||
        !lastName
      ) {
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
      const transactionRequest =
        new authorizenet.APIContracts.TransactionRequestType();
      transactionRequest.setTransactionType(
        authorizenet.APIContracts.TransactionTypeEnum.AUTHCAPTURETRANSACTION,
      );
      transactionRequest.setAmount(amount.toFixed(2));
      transactionRequest.setPayment(paymentType);
      transactionRequest.setCurrencyCode('CHF');
      transactionRequest.setBillTo(billTo);

      // Create the controller request
      const createRequest =
        new authorizenet.APIContracts.CreateTransactionRequest();
      createRequest.setMerchantAuthentication(this.merchantAuthentication);
      createRequest.setTransactionRequest(transactionRequest);

      const ctrl = new authorizenet.APIControllers.CreateTransactionController(
        createRequest.getJSON(),
      );
      ctrl.setEnvironment(this.environment);

      const response =
        await new Promise<authorizenet.APIContracts.CreateTransactionResponse>(
          (resolve, reject) => {
            ctrl.execute(() => {
              const rawResponse = ctrl.getResponse();
              if (rawResponse) {
                const apiResponse =
                  new authorizenet.APIContracts.CreateTransactionResponse(
                    rawResponse,
                  );
                resolve(apiResponse);
              } else {
                reject(new Error('No response from Authorize.Net'));
              }
            });
          },
        );

      if (!response || !response.getTransactionResponse()) {
        throw new Error('Invalid response from Authorize.Net');
      }

      const transactionResponse = response.getTransactionResponse();
      const resultCode = response.getMessages()?.getResultCode();

      if (resultCode !== 'Ok') {
        const errorMessages = response.getMessages()?.getMessage();
        const errors =
          errorMessages?.map((m: any) => m.getText()).join(', ') ||
          'Unknown error';
        throw new Error(`Payment failed: ${errors}`);
      }

      if (transactionResponse.getResponseCode() === '1') {
        return {
          transactionId: transactionResponse.getTransId(),
          authCode: transactionResponse.getAuthCode(),
        };
      } else {
        const errors = transactionResponse
          .getErrors()
          ?.getError()
          ?.map((e: any) => e.getErrorText()) || ['Unknown error'];
        throw new Error(`Transaction failed: ${errors.join(', ')}`);
      }
    } catch (error: any) {
      console.error('Create charge error:', error);
      throw new Error(`Payment processing failed: ${error.message}`);
    }
  }

  // Issue a refund
  async refund(
    request: RefundRequest,
  ): Promise<{ transactionId: string; status: string }> {
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
      const transactionRequest =
        new authorizenet.APIContracts.TransactionRequestType();
      transactionRequest.setTransactionType(
        authorizenet.APIContracts.TransactionTypeEnum.REFUNDTRANSACTION,
      );
      if (amount) transactionRequest.setAmount(amount.toFixed(2));
      transactionRequest.setPayment(paymentType);
      transactionRequest.setRefTransId(transactionId);

      // Create the controller request
      const createRequest =
        new authorizenet.APIContracts.CreateTransactionRequest();
      createRequest.setMerchantAuthentication(this.merchantAuthentication);
      createRequest.setTransactionRequest(transactionRequest);

      // Execute refund
      const ctrl = new authorizenet.APIControllers.CreateTransactionController(
        createRequest,
      );
      ctrl.setEnvironment(this.environment); // Set environment explicitly
      const response =
        await new Promise<authorizenet.APIContracts.CreateTransactionResponse>(
          (resolve, reject) => {
            ctrl.execute(() => {
              const apiResponse = ctrl.getResponse();
              if (apiResponse) resolve(apiResponse);
              else reject(new Error('No response from Authorize.Net'));
            });
          },
        );

      // Check response
      const transactionResponse = response.getTransactionResponse();
      if (
        response.getMessages().getResultCode() ===
          authorizenet.APIContracts.MessageTypeEnum.OK &&
        transactionResponse
      ) {
        if (transactionResponse?.getResponseCode() === '1') {
          return {
            transactionId: transactionResponse.getTransId(),
            status: 'Refunded',
          };
        } else {
          const errors = transactionResponse
            .getErrors()
            ?.getError()
            ?.map((e: { getErrorText: () => any }) => e.getErrorText()) || [
            'Unknown error',
          ];
          throw new Error(`Refund failed: ${errors.join(', ')}`);
        }
      } else {
        const errors = response
          .getMessages()
          ?.getMessage()
          ?.map((m: { getText: () => any }) => m.getText()) || [
          'Unknown error',
        ];
        throw new Error(`API error: ${errors.join(', ')}`);
      }
    } catch (error: any) {
      console.error('Refund error:', error);
      throw new Error(`Refund processing failed: ${error.message}`);
    }
  }

  // Check transaction status
  async checkStatus(transactionId: string): Promise<TransactionStatus> {
    try {
      // Create request
      const getRequest =
        new authorizenet.APIContracts.GetTransactionDetailsRequest();
      getRequest.setMerchantAuthentication(this.merchantAuthentication);
      getRequest.setTransId(transactionId);

      // Execute request
      const ctrl =
        new authorizenet.APIControllers.GetTransactionDetailsController(
          getRequest,
        );
      ctrl.setEnvironment(this.environment); // Set environment explicitly
      const response =
        await new Promise<authorizenet.APIContracts.GetTransactionDetailsResponse>(
          (resolve, reject) => {
            ctrl.execute(() => {
              const apiResponse = ctrl.getResponse();
              if (apiResponse) resolve(apiResponse);
              else reject(new Error('No response from Authorize.Net'));
            });
          },
        );

      // Check response
      if (
        response.getMessages().getResultCode() ===
        authorizenet.APIContracts.MessageTypeEnum.OK
      ) {
        const transaction = response.getTransaction();
        return {
          transactionId: transaction.getTransId(),
          status: transaction.getTransactionStatus(),
          responseCode: transaction.getResponseCode(),
          authCode: transaction.getAuthCode(),
          errors: transaction
            .getErrors()
            ?.getError()
            ?.map((e: { getErrorText: () => any }) => e.getErrorText()),
        };
      } else {
        const errors = response
          .getMessages()
          ?.getMessage()
          ?.map((m: { getText: () => any }) => m.getText()) || [
          'Unknown error',
        ];
        throw new Error(`Status check failed: ${errors.join(', ')}`);
      }
    } catch (error: any) {
      console.error('Check status error:', error);
      throw new Error(`Status check failed: ${error.message}`);
    }
  }
}
export default AuthPaymentService;





