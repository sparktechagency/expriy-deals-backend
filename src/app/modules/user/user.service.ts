/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import AppError from '../../error/AppError';
import { IUser } from './user.interface';
import { User } from './user.models';
import QueryBuilder from '../../class/builder/QueryBuilder';
import bcrypt from 'bcrypt';
import config from '../../config';
import { USER_ROLE } from './user.constants';
import Shop from '../shop/shop.models';
import { startSession } from 'mongoose';

export type IFilter = {
  searchTerm?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};

const createUser = async (payload: IUser): Promise<IUser> => {
  const session = await startSession();
  session.startTransaction();

  try {
    const isExist = await User.isUserExist(payload.email as string);
    if (isExist && !isExist?.verification?.status) {
      const { email, balance, ...updateData } = payload;
      updateData.password = await bcrypt.hash(
        payload?.password,
        Number(config.bcrypt_salt_rounds),
      );

      const user = await User.findByIdAndUpdate(isExist?._id, updateData, {
        new: true,
        session,
      });

      if (!user) {
        throw new AppError(httpStatus.BAD_REQUEST, 'User update failed');
      }

      await session.commitTransaction();
      session.endSession();
      return user;
    } else if (isExist && isExist?.verification?.status) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        'User already exists with this email',
      );
    }

    if (!payload.password) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Password is required');
    }

    if (payload.role === USER_ROLE.vendor) {
      //@ts-ignore
      const { shopName, location, ...userData } = payload;

      if (!shopName || !location) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          'Shop name and location are required for vendor',
        );
      }

      const user = await User.create([userData], { session });
      if (!user || user.length === 0) {
        throw new AppError(httpStatus.BAD_REQUEST, 'User creation failed');
      }

      const shop = await Shop.create(
        [{ name: shopName, location, author: user[0]._id }],
        { session },
      );

      if (!shop || shop.length === 0) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Shop creation failed');
      }

      const updatedUser = await User.findByIdAndUpdate(
        user[0]._id,
        { shop: shop[0]._id },
        { new: true, session },
      );

      await session.commitTransaction();
      session.endSession();

      return user[0];
    }

    const user = await User.create([payload], { session });
    if (!user || user.length === 0) {
      throw new AppError(httpStatus.BAD_REQUEST, 'User creation failed');
    }

    await session.commitTransaction();
    session.endSession();

    return user[0];
  } catch (error) {
    console.error(error);
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

// const createUser = async (payload: IUser): Promise<IUser> => {
//   const isExist = await User.isUserExist(payload.email as string);
//   if (isExist && !isExist?.verification?.status) {
//     const { email, balance, ...updateData } = payload;
//     updateData.password = await bcrypt.hash(
//       payload?.password,
//       Number(config.bcrypt_salt_rounds),
//     );

//     const user = await User.findByIdAndUpdate(isExist?._id, updateData, {
//       new: true,
//     });

//     if (!user) {
//       throw new AppError(httpStatus.BAD_REQUEST, 'user creation failed');
//     }

//     return user;
//   } else if (isExist && isExist?.verification?.status) {
//     throw new AppError(
//       httpStatus.FORBIDDEN,
//       'User already exists with this email',
//     );
//   }

//   if (!payload.password) {
//     throw new AppError(httpStatus.BAD_REQUEST, 'Password is required');
//   }

//   if (payload.role === USER_ROLE.vendor) {
//     const { shopName, location, ...userData } = payload;

//     if (!shopName || !location) {
//       throw new AppError(
//         httpStatus.BAD_REQUEST,
//         'Shop name and location are required for vendor',
//       );
//     }

//     const user = await User.create(userData);
//     if (!user) {
//       throw new AppError(httpStatus.BAD_REQUEST, 'User creation failed');
//     }

//     const shop = await Shop.create({
//       name: shopName,
//       location,
//       author: user._id,
//     });

//     if (!shop) {
//       throw new AppError(httpStatus.BAD_REQUEST, 'Shop creation failed');
//     }

//     const updatedUser = await User.findByIdAndUpdate(
//       user?._id,
//       { shop: shop._id },
//       { new: true },
//     );
//     return updatedUser;
//   }

//   const user = await User.create(payload);
//   if (!user) {
//     throw new AppError(httpStatus.BAD_REQUEST, 'User creation failed');
//   }
//   return user;
// };

const getAllUser = async (query: Record<string, any>) => {
  const userModel = new QueryBuilder(User.find(), query)
    .search(['name', 'email', 'phoneNumber', 'status'])
    .filter()
    .paginate()
    .sort();
  const data: any = await userModel.modelQuery;
  const meta = await userModel.countTotal();
  return {
    data,
    meta,
  };
};

const geUserById = async (id: string) => {
  const result = await User.findById(id);
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }
  return result;
};

const updateUser = async (id: string, payload: Partial<IUser>) => {
  delete payload.balance;
  const user = await User.findByIdAndUpdate(id, payload, { new: true });
  if (!user) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User updating failed');
  }

  return user;
};

const toggleUserStatusInDB = async (userId: string, loggedInUserId: string) => {
  if (userId === loggedInUserId)
    throw new AppError(httpStatus.NOT_FOUND, "Own status can't be changed");

  const isUserExist = await User.findById(userId);

  if (!isUserExist) throw new AppError(httpStatus.NOT_FOUND, 'User not found!');

  const res = await User.findByIdAndUpdate(
    userId,
    {
      status: isUserExist?.status === 'active' ? 'blocked' : 'active',
    },
    {
      new: true,
      runValidators: true,
    },
  );

  return res;
};

const deleteUser = async (id: string) => {
  const user = await User.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true },
  );

  if (!user) {
    throw new AppError(httpStatus.BAD_REQUEST, 'user deleting failed');
  }

  return user;
};

export const userService = {
  createUser,
  getAllUser,
  geUserById,
  updateUser,
  toggleUserStatusInDB,
  deleteUser,
};
