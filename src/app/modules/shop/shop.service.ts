import httpStatus from 'http-status';
import { IShop } from './shop.interface';
import Shop from './shop.models';
import AppError from '../../error/AppError';
import { UploadedFiles } from '../../interface/common.interface';
import { uploadToS3 } from '../../utils/s3';
import pickQuery from '../../utils/pickQuery';
import { Types } from 'mongoose';
import { paginationHelper } from '../../helpers/pagination.helpers';

const createShop = async (payload: IShop) => {
  const result = await Shop.create(payload);
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create shop');
  }
  return result;
};

const getAllShop = async (query: Record<string, any>) => {
  const { filters, pagination } = await pickQuery(query);

  const { searchTerm, latitude, longitude, ...filtersData } = filters;
  console.log({ latitude, longitude });

  if (filtersData?.author) {
    filtersData['author'] = new Types.ObjectId(filtersData?.author);
  }

  // Initialize the aggregation pipeline
  const pipeline: any[] = [];

  // If latitude and longitude are provided, add $geoNear to the aggregation pipeline
  if (latitude && longitude) {
    pipeline.push({
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [parseFloat(longitude), parseFloat(latitude)],
        },
        key: 'location',
        maxDistance: parseFloat(5 as unknown as string) * 1609, // 5 miles to meters
        distanceField: 'dist.calculated',
        spherical: true,
      },
    });
  }

  // Add a match to exclude deleted documents
  pipeline.push({
    $match: {
      isDeleted: false,
    },
  });

  // If searchTerm is provided, add a search condition
  if (searchTerm) {
    pipeline.push({
      $match: {
        $or: ['name', 'description'].map(field => ({
          [field]: {
            $regex: searchTerm,
            $options: 'i',
          },
        })),
      },
    });
  }

  if (Object.entries(filtersData).length) {
    // Add custom filters (filtersData) to the aggregation pipeline
    Object.entries(filtersData).map(([field, value]) => {
      if (/^\[.*?\]$/.test(value)) {
        const match = value.match(/\[(.*?)\]/);
        const queryValue = match ? match[1] : value;
        pipeline.push({
          $match: {
            [field]: { $in: [new Types.ObjectId(queryValue)] },
          },
        });
        delete filtersData[field];
      }
    });

    if (Object.entries(filtersData).length) {
      pipeline.push({
        $match: {
          $and: Object.entries(filtersData).map(([field, value]) => ({
            isDeleted: false,
            [field]: value,
          })),
        },
      });
    }
  }

  // Sorting condition
  const { page, limit, skip, sort } =
    paginationHelper.calculatePagination(pagination);

  if (sort) {
    const sortArray = sort.split(',').map(field => {
      const trimmedField = field.trim();
      if (trimmedField.startsWith('-')) {
        return { [trimmedField.slice(1)]: -1 };
      }
      return { [trimmedField]: 1 };
    });

    pipeline.push({ $sort: Object.assign({}, ...sortArray) });
  }

  pipeline.push({
    $facet: {
      totalData: [{ $count: 'total' }],
      paginatedData: [
        { $skip: skip },
        { $limit: limit },
        // Lookups
        {
          $lookup: {
            from: 'users',
            localField: 'author',
            foreignField: '_id',
            as: 'author',
            pipeline: [
              {
                $project: {
                  name: 1,
                  email: 1,
                  phoneNumber: 1,
                  profile: 1,
                },
              },
            ],
          },
        },
        {
          $addFields: {
            author: { $arrayElemAt: ['$author', 0] },
          },
        },
      ],
    },
  });

  const [result] = await Shop.aggregate(pipeline);

  const total = result?.totalData?.[0]?.total || 0;
  const data = result?.paginatedData || [];

  return {
    meta: { page, limit, total },
    data,
  };
};

const getShopById = async (id: string) => {
  const result = await Shop.findById(id).populate([
    { path: 'author', select: 'name email profile phoneNumber' },
  ]);
  if (!result || result?.isDeleted) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Shop not found!');
  }
  return result;
};
const getMyShopById = async (id: string) => {
  const result = await Shop.findOne({ author: id }).populate([
    { path: 'author', select: 'name email profile phoneNumber' },
  ]);
  if (!result || result?.isDeleted) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Shop not found!');
  }
  return result;
};

const updateShop = async (id: string, payload: Partial<IShop>, files: any) => {
  if (files) {
    const { logo, banner } = files as UploadedFiles;

    if (logo?.length) {
      payload.logo = (await uploadToS3({
        file: logo[0],
        fileName: `images/shop/logo/${Math.floor(100000 + Math.random() * 900000)}`,
      })) as string;
    }
    if (banner?.length) {
      payload.banner = (await uploadToS3({
        file: banner[0],
        fileName: `images/shop/banner/${Math.floor(100000 + Math.random() * 900000)}`,
      })) as string;
    }
  }

  const result = await Shop.findByIdAndUpdate(id, payload, { new: true });
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to update Shop');
  }
  return result;
};

const updateMyShop = async (
  userId: string,
  payload: Partial<IShop>,
  files: any,
) => {
  if (files) {
    const { logo, banner } = files as UploadedFiles;

    if (logo?.length) {
      payload.logo = (await uploadToS3({
        file: logo[0],
        fileName: `images/shop/logo/${Math.floor(100000 + Math.random() * 900000)}`,
      })) as string;
    }
    if (banner?.length) {
      payload.banner = (await uploadToS3({
        file: banner[0],
        fileName: `images/shop/banner/${Math.floor(100000 + Math.random() * 900000)}`,
      })) as string;
    }
  }

  const result = await Shop.findOneAndUpdate({ author: userId }, payload, {
    new: true,
  });
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to update Shop');
  }
  return result;
};

const deleteShop = async (id: string) => {
  const result = await Shop.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true },
  );
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to delete shop');
  }
  return result;
};

export const shopService = {
  createShop,
  getAllShop,
  getShopById,
  updateShop,
  deleteShop,
  updateMyShop,
  getMyShopById,
};
