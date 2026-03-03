import { Prisma } from '@prisma/client';
import { IPaginationOptions } from '../../interface/pagination.type';
import { prisma } from '../../utils/prisma';
import ApiError from '../../errors/AppError';
import httpStatus from 'http-status';
import { paginationHelper } from '../../utils/calculatePagination';


const createFavorite = async (userId: string, articleId: string) => {
  // const article = await prisma.test.findUnique({
  //   where: {
  //     id: articleId,
  //   },
  // });
  const article = {}
  if (!article) {
    throw new ApiError(404, 'Article not found');
  }
  const existingFavorite = await prisma.favorite.findFirst({
    where: {
      userId,
      articleId,
    },
  });

  if (existingFavorite) {
    await prisma.favorite.delete({
      where: { id: existingFavorite.id },
    });
    return {
      articleId,
      isFavorite: false,
      data: {
        id: existingFavorite.id,
        userId: existingFavorite.userId,
        articleId: existingFavorite.articleId,
        isFavorite: false,
        createdAt: existingFavorite.createdAt,
        updatedAt: new Date(),
      },
      message: 'Removed from favorites',
    };
  } else {
    const newFavorite = await prisma.favorite.create({
      data: {
        userId,
        articleId,
        isFavorite: true,
      },
    });

    return {
      articleId,
      isFavorite: true,
      data: newFavorite,
      message: 'Added to favorites',
    };
  }
};

// get all Favorite
type IFavoriteFilterRequest = {
  searchTerm?: string;
  id?: string;
  createdAt?: string;
};
const favoriteSearchAbleFields = ['title'];
const getFavoriteListIntoDb = async (
  options: IPaginationOptions,
  filters: IFavoriteFilterRequest,
  userId: string,
) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  const andConditions: Prisma.favoriteWhereInput[] = [];

  andConditions.push({ userId });

  // if (searchTerm) {
  //   andConditions.push({
  //     OR: [
  //       {
  //         article: {
  //           title: {
  //             contains: searchTerm,
  //             mode: 'insensitive',
  //           },
  //         },
  //       },
  //     ],
  //   });
  // }

  if (Object.keys(filterData).length > 0) {
    Object.keys(filterData).forEach(key => {
      const value = (filterData as any)[key];
      if (!value) return;

      if (key === 'createdAt') {
        const start = new Date(value);
        start.setHours(0, 0, 0, 0);
        const end = new Date(value);
        end.setHours(23, 59, 59, 999);

        andConditions.push({
          createdAt: {
            gte: start.toISOString(),
            lte: end.toISOString(),
          },
        });
        return;
      }

      if (key.includes('.')) {
        const [relation, field] = key.split('.');
        andConditions.push({
          [relation]: { [field]: value },
        });
        return;
      }
      andConditions.push({ [key]: value });
    });
  }

  const whereConditions: Prisma.favoriteWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : { userId };

  const result = await prisma.favorite.findMany({
    where: whereConditions,
    // include: {
    //   article: true,
    // },
    orderBy: { createdAt: 'desc' },
    skip,
    take: limit,
  });

  const total = await prisma.favorite.count({
    where: whereConditions,
  });

  const formattedData = result.map(fav => ({
    // ...fav.article,
    isFavorite: true,
  }));

  return {
    meta: {
      total,
      page,
      limit,
    },
    data: formattedData,
  };
};

// get Favorite by id
const getFavoriteById = async (id: string) => {
  const result = await prisma.favorite.findUnique({
    where: { id },
  });
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Favorite not found');
  }
  return result;
};

// update Favorite
const updateFavoriteIntoDb = async (id: string, data: any) => {
  const result = await prisma.favorite.update({
    where: { id },
    data,
  });
  return result;
};

// delete Favorite
const deleteFavoriteIntoDb = async (id: string) => {
  const result = await prisma.favorite.delete({
    where: { id },
  });
  return result;
};

export const favoriteService = {
  createFavorite,
  getFavoriteListIntoDb,
  getFavoriteById,
  updateFavoriteIntoDb,
  deleteFavoriteIntoDb,
};
