import httpStatus from 'http-status';
import { IAddToCard } from './addToCard.interface';
import AddToCard from './addToCard.models';
import AppError from '../../error/AppError';
import QueryBuilder from '../../class/builder/QueryBuilder';

const createAddToCard = async (payload: IAddToCard) => {
  const result = await AddToCard.create(payload);
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create addToCard');
  }
  return result;
};

const getAllAddToCard = async (query: Record<string, any>) => {
  const addToCardModel = new QueryBuilder(
    AddToCard.find().populate([
      { path: 'user', select: 'name email phoneNumber profile' },
      {
        path: 'product',
        populate: [
          {
            path: 'author',
            select: 'name email profile phoneNumber shop',
            populate: { path: 'shop' },
          },
          { path: 'category', select: 'name banner' },
        ],
      },
    ]),
    query,
  )
    .search([''])
    .filter()
    .paginate()
    .sort()
    .fields();

  const data = await addToCardModel.modelQuery;
  const meta = await addToCardModel.countTotal();

  return {
    data,
    meta,
  };
};

const getAddToCardById = async (id: string) => {
  const result = await AddToCard.findById(id).populate([
    { path: 'user', select: 'name email phoneNumber profile' },
    { path: 'product', populate: { path: 'category' } },
  ]);
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'AddToCard not found!');
  }
  return result;
};

const updateAddToCard = async (id: string, payload: Partial<IAddToCard>) => {
  const result = await AddToCard.findByIdAndUpdate(id, payload, { new: true });
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to update AddToCard');
  }
  return result;
};

const deleteAddToCard = async (id: string) => {
  const result = await AddToCard.findByIdAndDelete(id);
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to delete addToCard');
  }
  return result;
};

export const addToCardService = {
  createAddToCard,
  getAllAddToCard,
  getAddToCardById,
  updateAddToCard,
  deleteAddToCard,
};
