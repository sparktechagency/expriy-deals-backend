import httpStatus from 'http-status';
import { IOrder } from './order.interface';
import Order from './order.models';
import AppError from '../../error/AppError';
import QueryBuilder from '../../class/builder/QueryBuilder';
import Products from '../products/products.models';
import { IProducts } from '../products/products.interface';

const createOrder = async (payload: IOrder) => {
  for (const item of payload!.items) {
    const product: IProducts | null = await Products.findById(item.product);

    if (!product) {
      throw new AppError(httpStatus.NOT_FOUND, 'Product is not found!');
    }

    item['price'] =
      product.discount && product.discount > 0
        ? parseFloat((product.price * (1 - product.discount / 100)).toFixed(2))
        : product.price;
    if (product.discount) {
      item['discount'] = product.discount;
    }
  }

  const total = payload.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const taxRate = 0.0825; // 8.25%

  const taxAmount = total * taxRate;

  payload.totalPrice = parseFloat((total + taxAmount).toFixed(2));

  // const product: IProducts | null = await Products.findById(payload?.product);

  // if (!product) {
  //   throw new AppError(httpStatus.NOT_FOUND, 'Product is not found!');
  // }

  // payload.author = product?.author;
  // const taxRate = 0.0825; // 8.25%

  // if (product.discount && product.discount > 0) {
  //   const discountedPrice = product.price * (1 - product.discount / 100);
  //   const subtotal = discountedPrice * payload.quantity;
  //   payload.totalPrice = parseFloat((subtotal * (1 + taxRate)).toFixed(2));
  // } else {
  //   const subtotal = product.price * payload.quantity;
  //   payload.totalPrice = parseFloat((subtotal * (1 + taxRate)).toFixed(2));
  // }

  // payload.discount = Number(product?.discount);
  const result = await Order.create(payload);
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create order');
  }
  return result;
};

const getAllOrder = async (query: Record<string, any>) => {
  const orderModel = new QueryBuilder(
    Order.find({ isDeleted: false }).populate([
      {
        path: 'items.product',
        populate: [
          {
            path: 'author',
            select: 'name email profile phoneNumber shop',
            populate: { path: 'shop' },
          },
          { path: 'category', select: 'name banner' },
        ],
      },
      {
        path: 'author',
        select: 'name email phoneNumber profile',
        populate: [{ path: 'shop', select: 'name logo banner bannerColor' }],
      },
      { path: 'user', select: 'name email phoneNumber profile' },
    ]),
    query,
  )
    .search([''])
    .filter()
    .paginate()
    .sort()
    .fields();

  const data = await orderModel.modelQuery;
  const meta = await orderModel.countTotal();

  return {
    data,
    meta,
  };
};

const getOrderById = async (id: string) => {
  const result = await Order.findById(id).populate([
    {
      path: 'items.product',
      populate: [
        {
          path: 'author',
          select: 'name email profile phoneNumber shop',
          populate: { path: 'shop' },
        },
        { path: 'category', select: 'name banner' },
      ],
    },
    { path: 'author', select: 'name email phoneNumber profile' },
  ]);
  if (!result || result?.isDeleted) {
    throw new Error('Order not found!');
  }
  return result;
};

const updateOrder = async (id: string, payload: Partial<IOrder>) => {
  const result = await Order.findByIdAndUpdate(id, payload, { new: true });
  if (!result) {
    throw new Error('Failed to update Order');
  }
  return result;
};

const deleteOrder = async (id: string) => {
  const result = await Order.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true },
  );
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to delete order');
  }
  return result;
};

export const orderService = {
  createOrder,
  getAllOrder,
  getOrderById,
  updateOrder,
  deleteOrder,
};
