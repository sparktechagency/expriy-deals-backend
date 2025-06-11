import Stripe from 'stripe';
import config from '../../config';
import { User } from '../user/user.models';
import AppError from '../../error/AppError';
import httpStatus from 'http-status';
import StripePaymentService from '../../class/stripe/stripe';

const stripe = new Stripe(config.stripe?.stripe_api_secret as string, {
  apiVersion: '2024-06-20',
  typescript: true,
});

// Create Stripe account and return the account link URL
const stripLinkAccount = async (userId: string) => {
  console.log(config.stripe?.stripe_api_secret);
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User not found!');
  }

  try {
    const account = await stripe.accounts.create({});

    // const accountLink = await stripe.accountLinks.create({
    //   account: account.id,
    //   type: 'account_onboarding',
    // });
    const return_url = `${config?.server_url}/stripe/return/${account.id}?userId=${user?._id}`;
    const refresh_url = `${config?.server_url}/stripe/refresh/${account.id}?userId=${user?._id}`;

    const accountLink = await StripePaymentService?.connectAccount(
      return_url,
      refresh_url,
      account.id,
    );

    return accountLink.url;
  } catch (error: any) {
    throw new AppError(httpStatus.BAD_GATEWAY, error.message);
  }
};

// Handle Stripe OAuth and save the connected account ID
const handleStripeOAuth = async (
  query: Record<string, any>,
  userId: string,
) => {
  try {
    const response = await stripe.oauth.token({
      grant_type: 'authorization_code',

      code: query.code as string,
    });

    const connectedAccountId = response.stripe_user_id;

    await User.findByIdAndUpdate(userId, {
      stripeAccountId: connectedAccountId,
    });
  } catch (error: any) {
    throw new AppError(httpStatus.BAD_REQUEST, error.message);
  }
};

// Refresh the account link for a given payment ID
const refresh = async (paymentId: string, query: Record<string, any>) => {
  const user = await User.findById(query.userId);

  if (!user) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User not found!');
  }

  try {
    const return_url = `${config?.client_Url}/seller/confirmation?userId=${user._id}&stripeAccountId=${paymentId}`;
    const refresh_url = `${config?.server_url}/stripe/refresh/${paymentId}?userId=${user?._id}`;

    const accountLink = await StripePaymentService?.connectAccount(
      return_url,
      refresh_url,
      paymentId,
    );

    return accountLink.url;
  } catch (error: any) {
    throw new AppError(httpStatus.BAD_REQUEST, error.message);
  }
};

// Handle the return URL and update the user's Stripe account ID
const returnUrl = async (payload: {
  stripeAccountId: string;
  userId: string;
}) => {
  try {
    // const response = await stripe.oauth.token({
    //   grant_type: "authorization_code",
    //   code: query.code as string,
    // });

    // const connectedAccountId = response.stripe_user_id;

    const user = await User.findByIdAndUpdate(payload.userId, {
      stripeAccountId: payload?.stripeAccountId,
    });

    if (!user) {
      throw new AppError(httpStatus.BAD_REQUEST, 'user not found!');
    }
    return { url: config?.client_Url };
  } catch (error: any) {
    throw new AppError(httpStatus.BAD_REQUEST, error.message);
  }
};

// Create a payment intent
export const createPaymentIntent = async (amount: number, currency: string) => {
  return await stripe.paymentIntents.create({
    amount,
    currency,
  });
};

// Create a transfer to a seller's Stripe account
export const createTransfer = async (
  amount: number,
  sellerStripeAccountId: string,
) => {
  try {
    const balance = await stripe.balance.retrieve();
    const availableBalance = balance.available.reduce(
      (total, bal) => total + bal.amount,
      0,
    );
    if (availableBalance < amount) {
      console.log('Insufficient funds to cover the transfer.');
      throw new AppError(
        httpStatus?.BAD_REQUEST,
        'Insufficient funds to cover the transfer.',
      );
    }

    return await stripe.transfers.create({
      amount,
      currency: 'usd',
      destination: sellerStripeAccountId,
    });
  } catch (error) {
    console.error(error);
  }
};

export const stripeRefund = async (
  payment_intent: string,
  amount: number,
): Promise<Stripe.Response<Stripe.Refund>> => {
  try {
    const refund = await stripe.refunds.create({
      payment_intent: payment_intent,
      amount: Math.round(amount),
    });

    return refund;
  } catch (error: any) {
    console.error(error);
    throw new AppError(httpStatus.BAD_REQUEST, error?.message);
  }
};

export async function addFundsToTestAccount() {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
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
  } catch (error) {
    console.error('Error adding funds:', error);
  }
}

 

export const stripeService = {
  handleStripeOAuth,
  stripLinkAccount,
  refresh,
  returnUrl,
};
